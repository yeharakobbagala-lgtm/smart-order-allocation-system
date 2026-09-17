import pandas as pd  # type: ignore[import-not-found]
import joblib

from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report


BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "support_messages.csv"
MODEL_DIR = BASE_DIR / "models"

MODEL_DIR.mkdir(exist_ok=True)


# 1. Load dataset
df = pd.read_csv(DATA_PATH)

# 2. Remove rows without a category
df = df.dropna(subset=["message", "category"])

# 3. Get input and labels
X = df["message"]
y = df["category"]

print(f"Training samples: {len(df)}")
print(f"Categories: {y.unique()}")


# 4. Split dataset
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


# 5. Convert text into numerical features
vectorizer = TfidfVectorizer(
    lowercase=True,
    stop_words="english",
    ngram_range=(1, 2)
)

X_train_tfidf = vectorizer.fit_transform(X_train)
X_test_tfidf = vectorizer.transform(X_test)


# 6. Train classifier
model = LogisticRegression(
    max_iter=1000
)

model.fit(X_train_tfidf, y_train)


# 7. Evaluate
predictions = model.predict(X_test_tfidf)

accuracy = accuracy_score(y_test, predictions)

print("\nAccuracy:", round(accuracy, 4))

print("\nClassification Report:")
print(classification_report(y_test, predictions))


# 8. Save model
joblib.dump(
    model,
    MODEL_DIR / "classifier.joblib"
)

joblib.dump(
    vectorizer,
    MODEL_DIR / "vectorizer.joblib"
)

print("\nModel saved successfully!")