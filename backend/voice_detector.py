import os
import numpy as np
import librosa


def analyze_voice(audio_path):
    """
    Analyze an audio recording and calculate a prototype
    voice-impersonation risk score.

    NOTE:
    This is a prototype acoustic-risk detector.
    It does NOT prove that a voice is AI-generated.
    A trained anti-spoofing/deepfake model is required
    for reliable voice-cloning detection.
    """

    if not os.path.exists(audio_path):
        return {
            "status": "error",
            "message": "Audio file not found."
        }

    try:

        # ============================================
        # 1. LOAD AUDIO
        # ============================================

        audio, sample_rate = librosa.load(
            audio_path,
            sr=16000,
            mono=True
        )

        if len(audio) == 0:
            return {
                "status": "error",
                "message": "Audio file is empty."
            }

        # ============================================
        # 2. BASIC AUDIO FEATURES
        # ============================================

        duration = len(audio) / sample_rate

        rms = librosa.feature.rms(y=audio)[0]

        zcr = librosa.feature.zero_crossing_rate(audio)[0]

        spectral_centroid = librosa.feature.spectral_centroid(
            y=audio,
            sr=sample_rate
        )[0]

        average_energy = float(np.mean(rms))

        zero_crossing_rate = float(np.mean(zcr))

        average_centroid = float(
            np.mean(spectral_centroid)
        )

        energy_variation = float(
            np.std(rms)
        )

        # ============================================
        # 3. PROTOTYPE IMPERSONATION RISK SCORING
        # ============================================

        risk_score = 0

        indicators = []

        # --------------------------------------------
        # Short audio
        # --------------------------------------------

        if duration < 2:
            risk_score += 15
            indicators.append(
                "Very short audio sample"
            )

        # --------------------------------------------
        # Low frequency variation
        # --------------------------------------------

        if zero_crossing_rate < 0.03:
            risk_score += 20
            indicators.append(
                "Low voice-frequency variation"
            )

        # --------------------------------------------
        # Unusual spectral characteristics
        # --------------------------------------------

        if average_centroid < 250:
            risk_score += 15
            indicators.append(
                "Unusual spectral characteristics"
            )

        # --------------------------------------------
        # Low natural energy variation
        # --------------------------------------------

        if energy_variation < 0.01:
            risk_score += 20
            indicators.append(
                "Low natural energy variation"
            )

        # --------------------------------------------
        # Extremely low energy
        # --------------------------------------------

        if average_energy < 0.02:
            risk_score += 10
            indicators.append(
                "Unusually low audio energy"
            )

        # Keep score between 0 and 100
        risk_score = min(risk_score, 100)

        # ============================================
        # 4. RISK LEVEL
        # ============================================

        if risk_score >= 70:

            risk_level = "HIGH"

        elif risk_score >= 40:

            risk_level = "MEDIUM"

        else:

            risk_level = "LOW"

        # ============================================
        # 5. RECOMMENDATION
        # ============================================

        if risk_level == "HIGH":

            recommendation = (
                "HIGH IMPERSONATION RISK! "
                "Do not trust the caller's identity. "
                "Do not share OTPs, passwords, banking details "
                "or transfer money. Verify the person through "
                "another trusted communication channel."
            )

        elif risk_level == "MEDIUM":

            recommendation = (
                "MEDIUM IMPERSONATION RISK. "
                "The recording contains suspicious acoustic "
                "characteristics. Verify the caller's identity "
                "before sharing sensitive information."
            )

        else:

            recommendation = (
                "LOW IMPERSONATION RISK. "
                "No strong suspicious acoustic indicators "
                "were detected. However, this does not guarantee "
                "that the voice is genuine."
            )

        # ============================================
        # 6. FINAL RESULT
        # ============================================

        return {

            "status": "success",

            "duration_seconds": round(
                duration,
                2
            ),

            "average_energy": round(
                average_energy,
                4
            ),

            "zero_crossing_rate": round(
                zero_crossing_rate,
                4
            ),

            "spectral_centroid": round(
                average_centroid,
                2
            ),

            "energy_variation": round(
                energy_variation,
                4
            ),

            "impersonation_risk_score": risk_score,

            "risk_level": risk_level,

            "indicators": indicators,

            "recommendation": recommendation,

            "disclaimer": (
                "This is a prototype acoustic-risk assessment. "
                "A dedicated trained anti-spoofing model is "
                "required to confirm AI-generated or cloned voice."
            )
        }

    except Exception as e:

        return {
            "status": "error",
            "message": str(e)
        }


# ================================================
# TEST PROGRAM
# ================================================

if __name__ == "__main__":

    print("======================================")
    print("   THREAT TRACKERS VOICE DETECTOR")
    print("======================================")

    audio_file = input(
        "Enter the path of a WAV/MP3 audio file: "
    )

    result = analyze_voice(audio_file)

    print("\nVOICE ANALYSIS RESULT")
    print("------------------------------")

    if result["status"] == "success":

        print(
            "Audio Duration:",
            result["duration_seconds"],
            "seconds"
        )

        print(
            "Average Energy:",
            result["average_energy"]
        )

        print(
            "Zero Crossing Rate:",
            result["zero_crossing_rate"]
        )

        print(
            "Spectral Centroid:",
            result["spectral_centroid"]
        )

        print(
            "Energy Variation:",
            result["energy_variation"]
        )

        print("\nAI IMPERSONATION RISK")
        print("------------------------------")

        print(
            "Risk Score:",
            result["impersonation_risk_score"],
            "/ 100"
        )

        print(
            "Risk Level:",
            result["risk_level"]
        )

        if result["indicators"]:

            print("\nDetected Indicators:")

            for indicator in result["indicators"]:

                print("-", indicator)

        else:

            print(
                "\nNo strong suspicious indicators detected."
            )

        print("\nRecommendation:")
        print(result["recommendation"])

        print("\nDisclaimer:")
        print(result["disclaimer"])

    else:

        print(
            "ERROR:",
            result["message"]
        )