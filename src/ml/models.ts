import { EngineeredFeatureRow, ModelType, ModelEvaluation, SingleModelPrediction } from './types';

// Feature vector extraction for models
export const MODEL_FEATURE_KEYS: (keyof EngineeredFeatureRow)[] = [
  'sma7',
  'sma30',
  'dailyReturn',
  'volatility20',
  'rsi14',
  'macd',
  'atr14',
  'volumeRatio'
];

interface Sample {
  x: number[];
  y: number; // targetNextDayReturn (%)
  date: string;
}

// Simple matrix inversion for Ridge / OLS: (X^T X + lambda I)^(-1)
function invertMatrix(matrix: number[][]): number[][] {
  const n = matrix.length;
  // Create identity augmented matrix
  const A = matrix.map(row => [...row]);
  const I: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  );

  for (let i = 0; i < n; i++) {
    // Find pivot
    let pivot = A[i][i];
    let pivotRow = i;
    for (let r = i + 1; r < n; r++) {
      if (Math.abs(A[r][i]) > Math.abs(pivot)) {
        pivot = A[r][i];
        pivotRow = r;
      }
    }

    if (Math.abs(pivot) < 1e-9) {
      // Degenerate pivot, add small diagonal regularization
      A[i][i] += 1e-4;
      pivot = A[i][i];
    }

    // Swap rows
    if (pivotRow !== i) {
      [A[i], A[pivotRow]] = [A[pivotRow], A[i]];
      [I[i], I[pivotRow]] = [I[pivotRow], I[i]];
    }

    // Normalize pivot row
    for (let j = 0; j < n; j++) {
      A[i][j] /= pivot;
      I[i][j] /= pivot;
    }

    // Eliminate other rows
    for (let r = 0; r < n; r++) {
      if (r !== i) {
        const factor = A[r][i];
        for (let j = 0; j < n; j++) {
          A[r][j] -= factor * A[i][j];
          I[r][j] -= factor * I[i][j];
        }
      }
    }
  }

  return I;
}

// -------------------------------------------------------------
// 1. LINEAR REGRESSION (Ridge / OLS)
// -------------------------------------------------------------
export class LinearRegressionModel {
  weights: number[] = [];
  bias: number = 0;

  fit(X: number[][], y: number[], lambdaReg: number = 0.05) {
    const n = X.length;
    const p = X[0].length;
    // Add bias column (1s)
    const Xb = X.map(row => [1, ...row]);
    const numCols = p + 1;

    // Compute X^T * X
    const XtX: number[][] = Array.from({ length: numCols }, () => new Array(numCols).fill(0));
    for (let i = 0; i < numCols; i++) {
      for (let j = 0; j < numCols; j++) {
        let sum = 0;
        for (let k = 0; k < n; k++) {
          sum += Xb[k][i] * Xb[k][j];
        }
        // Add L2 ridge regularization to diagonal (excluding bias)
        if (i === j && i > 0) {
          sum += lambdaReg;
        }
        XtX[i][j] = sum;
      }
    }

    // Compute X^T * y
    const Xty: number[] = new Array(numCols).fill(0);
    for (let i = 0; i < numCols; i++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += Xb[k][i] * y[k];
      }
      Xty[i] = sum;
    }

    // Solve beta = (X^T X)^(-1) * X^T y
    const invXtX = invertMatrix(XtX);
    const beta: number[] = new Array(numCols).fill(0);
    for (let i = 0; i < numCols; i++) {
      let sum = 0;
      for (let j = 0; j < numCols; j++) {
        sum += invXtX[i][j] * Xty[j];
      }
      beta[i] = sum;
    }

    this.bias = beta[0] || 0;
    this.weights = beta.slice(1);
  }

  predict(x: number[]): number {
    let pred = this.bias;
    for (let i = 0; i < x.length; i++) {
      pred += (this.weights[i] || 0) * x[i];
    }
    return pred;
  }
}

// -------------------------------------------------------------
// 2. DECISION TREE REGRESSOR (Weak learner for Random Forest & XGBoost)
// -------------------------------------------------------------
interface TreeNode {
  isLeaf: boolean;
  value: number;
  featureIndex?: number;
  splitThreshold?: number;
  left?: TreeNode;
  right?: TreeNode;
}

class DecisionTreeRegressor {
  root: TreeNode | null = null;
  maxDepth: number;
  minSamplesSplit: number;
  maxFeatures?: number;

  constructor(maxDepth: number = 4, minSamplesSplit: number = 3, maxFeatures?: number) {
    this.maxDepth = maxDepth;
    this.minSamplesSplit = minSamplesSplit;
    this.maxFeatures = maxFeatures;
  }

  fit(X: number[][], y: number[]) {
    this.root = this.buildTree(X, y, 0);
  }

  private buildTree(X: number[][], y: number[], depth: number): TreeNode {
    const numSamples = X.length;
    const numFeatures = X[0]?.length || 0;

    const meanY = y.reduce((a, b) => a + b, 0) / (numSamples || 1);

    // Stop conditions
    if (depth >= this.maxDepth || numSamples <= this.minSamplesSplit || numFeatures === 0) {
      return { isLeaf: true, value: meanY };
    }

    // Subsample features if maxFeatures is set (Random Forest)
    let featureIndices = Array.from({ length: numFeatures }, (_, i) => i);
    if (this.maxFeatures && this.maxFeatures < numFeatures) {
      featureIndices = featureIndices.sort(() => Math.random() - 0.5).slice(0, this.maxFeatures);
    }

    let bestMSE = Infinity;
    let bestFeature = -1;
    let bestThreshold = 0;
    let bestLeftIndices: number[] = [];
    let bestRightIndices: number[] = [];

    const currentMSE = this.calculateMSE(y, meanY);

    for (const fIdx of featureIndices) {
      // Find candidate thresholds
      const vals = X.map(row => row[fIdx]).sort((a, b) => a - b);
      const step = Math.max(1, Math.floor(vals.length / 8));

      for (let s = 1; s < vals.length; s += step) {
        const threshold = (vals[s - 1] + vals[s]) / 2;
        const leftIdx: number[] = [];
        const rightIdx: number[] = [];

        for (let i = 0; i < numSamples; i++) {
          if (X[i][fIdx] <= threshold) leftIdx.push(i);
          else rightIdx.push(i);
        }

        if (leftIdx.length < 2 || rightIdx.length < 2) continue;

        const leftY = leftIdx.map(i => y[i]);
        const rightY = rightIdx.map(i => y[i]);

        const leftMean = leftY.reduce((a, b) => a + b, 0) / leftY.length;
        const rightMean = rightY.reduce((a, b) => a + b, 0) / rightY.length;

        const mseSplit =
          (leftY.length * this.calculateMSE(leftY, leftMean) +
            rightY.length * this.calculateMSE(rightY, rightMean)) /
          numSamples;

        if (mseSplit < bestMSE) {
          bestMSE = mseSplit;
          bestFeature = fIdx;
          bestThreshold = threshold;
          bestLeftIndices = leftIdx;
          bestRightIndices = rightIdx;
        }
      }
    }

    // If split doesn't improve enough, make leaf
    if (bestMSE >= currentMSE * 0.999 || bestLeftIndices.length === 0 || bestRightIndices.length === 0) {
      return { isLeaf: true, value: meanY };
    }

    const leftX = bestLeftIndices.map(i => X[i]);
    const leftY = bestLeftIndices.map(i => y[i]);
    const rightX = bestRightIndices.map(i => X[i]);
    const rightY = bestRightIndices.map(i => y[i]);

    return {
      isLeaf: false,
      value: meanY,
      featureIndex: bestFeature,
      splitThreshold: bestThreshold,
      left: this.buildTree(leftX, leftY, depth + 1),
      right: this.buildTree(rightX, rightY, depth + 1)
    };
  }

  private calculateMSE(vals: number[], mean: number): number {
    return vals.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (vals.length || 1);
  }

  predict(x: number[]): number {
    let node = this.root;
    while (node && !node.isLeaf) {
      if (node.featureIndex !== undefined && node.splitThreshold !== undefined) {
        if (x[node.featureIndex] <= node.splitThreshold) {
          node = node.left || null;
        } else {
          node = node.right || null;
        }
      } else {
        break;
      }
    }
    return node ? node.value : 0;
  }
}

// -------------------------------------------------------------
// 3. RANDOM FOREST REGRESSOR
// -------------------------------------------------------------
export class RandomForestModel {
  trees: DecisionTreeRegressor[] = [];
  numTrees: number;
  maxDepth: number;

  constructor(numTrees: number = 20, maxDepth: number = 4) {
    this.numTrees = numTrees;
    this.maxDepth = maxDepth;
  }

  fit(X: number[][], y: number[]) {
    this.trees = [];
    const n = X.length;
    const p = X[0]?.length || 1;
    const maxFeatures = Math.max(2, Math.floor(Math.sqrt(p)) + 1);

    for (let t = 0; t < this.numTrees; t++) {
      // Bootstrap sampling with replacement (Bagging)
      const bootX: number[][] = [];
      const bootY: number[] = [];
      for (let i = 0; i < n; i++) {
        const randIdx = Math.floor(Math.random() * n);
        bootX.push(X[randIdx]);
        bootY.push(y[randIdx]);
      }

      const tree = new DecisionTreeRegressor(this.maxDepth, 3, maxFeatures);
      tree.fit(bootX, bootY);
      this.trees.push(tree);
    }
  }

  predict(x: number[]): number {
    if (this.trees.length === 0) return 0;
    const sum = this.trees.reduce((acc, tree) => acc + tree.predict(x), 0);
    return sum / this.trees.length;
  }
}

// -------------------------------------------------------------
// 4. XGBOOST / GRADIENT BOOSTED TREES REGRESSOR
// -------------------------------------------------------------
export class XGBoostModel {
  trees: DecisionTreeRegressor[] = [];
  learningRate: number;
  numRounds: number;
  basePrediction: number = 0;

  constructor(numRounds: number = 20, learningRate: number = 0.1) {
    this.numRounds = numRounds;
    this.learningRate = learningRate;
  }

  fit(X: number[][], y: number[]) {
    this.trees = [];
    const n = X.length;
    this.basePrediction = y.reduce((a, b) => a + b, 0) / (n || 1);

    const currentPreds = new Array(n).fill(this.basePrediction);

    for (let r = 0; r < this.numRounds; r++) {
      // Calculate pseudo-residuals (negative gradient for MSE loss)
      const residuals = y.map((actual, i) => actual - currentPreds[i]);

      // Fit weak learner to residuals
      const tree = new DecisionTreeRegressor(3, 3);
      tree.fit(X, residuals);

      // Update predictions with shrinkage
      for (let i = 0; i < n; i++) {
        currentPreds[i] += this.learningRate * tree.predict(X[i]);
      }

      this.trees.push(tree);
    }
  }

  predict(x: number[]): number {
    let pred = this.basePrediction;
    for (const tree of this.trees) {
      pred += this.learningRate * tree.predict(x);
    }
    return pred;
  }
}

// -------------------------------------------------------------
// Pipeline Model Training & Evaluation
// -------------------------------------------------------------
export function trainAndEvaluateModels(rows: EngineeredFeatureRow[]): {
  evaluations: Record<ModelType, ModelEvaluation>;
  predictions: SingleModelPrediction[];
  trainedLinear: LinearRegressionModel;
  trainedRF: RandomForestModel;
  trainedXGB: XGBoostModel;
} {
  const validRows = rows.filter(r => r.targetNextDayReturn !== undefined);
  const latestRow = rows[rows.length - 1];

  // Prepare samples
  const samples: Sample[] = validRows.map(r => ({
    x: MODEL_FEATURE_KEYS.map(k => Number(r[k])),
    y: r.targetNextDayReturn as number,
    date: r.date
  }));

  // Chronological 80/20 train/test split to prevent lookahead data leakage
  const splitIndex = Math.max(10, Math.floor(samples.length * 0.8));
  const trainSamples = samples.slice(0, splitIndex);
  const testSamples = samples.slice(splitIndex);

  const trainX = trainSamples.map(s => s.x);
  const trainY = trainSamples.map(s => s.y);
  const testX = testSamples.map(s => s.x);
  const testY = testSamples.map(s => s.y);

  // Train Linear Regression
  const linearModel = new LinearRegressionModel();
  linearModel.fit(trainX, trainY);

  // Train Random Forest
  const rfModel = new RandomForestModel(24, 4);
  rfModel.fit(trainX, trainY);

  // Train XGBoost
  const xgbModel = new XGBoostModel(24, 0.1);
  xgbModel.fit(trainX, trainY);

  // Model Evaluation metrics function
  const evaluate = (
    modelType: ModelType,
    displayName: string,
    predictFn: (x: number[]) => number
  ): ModelEvaluation => {
    let sumSqErr = 0;
    let sumAbsErr = 0;
    let correctDirection = 0;
    const predictions: { date: string; actual: number; predicted: number }[] = [];

    const testMean = testY.reduce((a, b) => a + b, 0) / (testY.length || 1);
    let totalVar = 0;

    for (let i = 0; i < testSamples.length; i++) {
      const pred = Number(predictFn(testX[i]).toFixed(3));
      const actual = testY[i];
      const err = pred - actual;

      sumSqErr += err * err;
      sumAbsErr += Math.abs(err);
      totalVar += Math.pow(actual - testMean, 2);

      // Directional accuracy: sign(pred) == sign(actual)
      if ((pred >= 0 && actual >= 0) || (pred < 0 && actual < 0)) {
        correctDirection++;
      }

      predictions.push({
        date: testSamples[i].date,
        actual: Number(actual.toFixed(2)),
        predicted: pred
      });
    }

    const n = testSamples.length || 1;
    const rmse = Number(Math.sqrt(sumSqErr / n).toFixed(3));
    const mae = Number((sumAbsErr / n).toFixed(3));
    // R2 score
    let r2 = totalVar > 0 ? 1 - sumSqErr / totalVar : 0;
    // Bound R2 for display readability
    r2 = Number(Math.max(-0.5, Math.min(0.95, r2)).toFixed(3));
    const directionalAccuracy = Number(((correctDirection / n) * 100).toFixed(1));

    return {
      modelType,
      displayName,
      rmse,
      mae,
      r2,
      directionalAccuracy,
      testSampleSize: testSamples.length,
      testPredictions: predictions
    };
  };

  const evalLinear = evaluate('linear_regression', 'Linear Regression', x => linearModel.predict(x));
  const evalRF = evaluate('random_forest', 'Random Forest', x => rfModel.predict(x));
  const evalXGB = evaluate('xgboost', 'XGBoost', x => xgbModel.predict(x));

  // Predict on latest bar for forecast generation
  const latestVector = MODEL_FEATURE_KEYS.map(k => Number(latestRow[k]));
  const currentPrice = latestRow.close;

  const buildSinglePrediction = (
    type: ModelType,
    name: string,
    predReturn: number,
    evalMetrics: ModelEvaluation
  ): SingleModelPrediction => {
    // Threshold for bullish / bearish
    let stance: 'Bullish' | 'Bearish' | 'Neutral' = 'Neutral';
    if (predReturn > 0.15) stance = 'Bullish';
    else if (predReturn < -0.15) stance = 'Bearish';

    const targetPrice = Number((currentPrice * (1 + predReturn / 100)).toFixed(2));
    // Confidence score based on directional accuracy and bounded error
    const confidence = Math.min(
      95,
      Math.max(45, Math.round(evalMetrics.directionalAccuracy * 0.7 + (1 / (1 + evalMetrics.rmse)) * 30))
    );

    return {
      modelType: type,
      displayName: name,
      predictedReturnPercent: Number(predReturn.toFixed(2)),
      targetPrice,
      stance,
      confidence,
      rmse: evalMetrics.rmse,
      r2: evalMetrics.r2
    };
  };

  const predLinear = buildSinglePrediction(
    'linear_regression',
    'Linear Regression',
    linearModel.predict(latestVector),
    evalLinear
  );
  const predRF = buildSinglePrediction(
    'random_forest',
    'Random Forest',
    rfModel.predict(latestVector),
    evalRF
  );
  const predXGB = buildSinglePrediction(
    'xgboost',
    'XGBoost',
    xgbModel.predict(latestVector),
    evalXGB
  );

  return {
    evaluations: {
      linear_regression: evalLinear,
      random_forest: evalRF,
      xgboost: evalXGB
    },
    predictions: [predLinear, predRF, predXGB],
    trainedLinear: linearModel,
    trainedRF: rfModel,
    trainedXGB: xgbModel
  };
}
