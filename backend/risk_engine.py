def calculate_risk(indicators):
    """
    Calculate a risk score based on detected threat indicators.
    """

    score = 0

    # Assign risk points to different indicators
    for indicator in indicators:

        if indicator == "Urgency or pressure":
            score += 20

        elif indicator == "OTP or verification-code request":
            score += 30

        elif indicator == "Payment or money request":
            score += 30

        elif indicator == "Contains a suspicious link":
            score += 25

        elif indicator == "Banking or KYC-related content":
            score += 20

        elif indicator == "Prize or reward claim":
            score += 20

        elif indicator == "Suspicious job or earning opportunity":
            score += 25

        elif indicator == "Suspicious investment or profit claim":
            score += 30

        elif indicator == "Possible impersonation of an authority or organization":
            score += 25

        elif indicator == "Request for sensitive information":
            score += 30

    # Keep score between 0 and 100
    score = min(score, 100)

    # Determine risk level
    if score >= 70:
        risk_level = "HIGH"

    elif score >= 40:
        risk_level = "MEDIUM"

    else:
        risk_level = "LOW"

    return score, risk_level


# Test the risk engine
if __name__ == "__main__":

    test_indicators = [
        "Urgency or pressure",
        "OTP or verification-code request",
        "Banking or KYC-related content"
    ]

    score, risk = calculate_risk(test_indicators)

    print("Risk Score:", score)
    print("Risk Level:", risk)