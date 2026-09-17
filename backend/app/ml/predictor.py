import joblib
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"

model = joblib.load(MODEL_DIR / "classifier.joblib")
vectorizer = joblib.load(MODEL_DIR / "vectorizer.joblib")


def classify_message(message: str):
    # Convert message into TF-IDF features
    features = vectorizer.transform([message])

    # Predict category
    prediction = model.predict(features)[0]

    # Get confidence
    probabilities = model.predict_proba(features)[0]
    confidence = float(max(probabilities))

    # Low confidence threshold
    low_confidence = confidence < 0.60

    return {
        "category": prediction,
        "confidence": round(confidence, 2),
        "low_confidence": low_confidence
    }


if __name__ == "__main__":
    test_messages = [
        "My payment was deducted but my order is not showing",
        "Where is my package?",
        "I want to cancel my order",
        "Do you have gaming laptops?"
    ]

    for message in test_messages:
        result = classify_message(message)

        print("\nMessage:", message)
        print("Result:", result)