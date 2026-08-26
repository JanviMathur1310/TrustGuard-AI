import os
import tempfile
import subprocess
import numpy as np
import librosa
import imageio_ffmpeg


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

    converted_audio_path = None

    try:

        # ============================================
        # LOAD AUDIO
        # Supports WAV, MP3, OGG, FLAC and WEBM
        # ============================================

        if audio_path.lower().endswith(".webm"):

            ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()

            converted_audio_path = os.path.join(
                tempfile.gettempdir(),
                "trustguard_converted.wav"
            )

            subprocess.run(
                [
                    ffmpeg,
                    "-y",
                    "-i",
                    audio_path,
                    "-ar",
                    "16000",
                    "-ac",
                    "1",
                    converted_audio_path
                ],
                check=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.PIPE
            )

            audio_path = converted_audio_path

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

        # Short recordings increase uncertainty,
        # but should not automatically mean high risk.
        if duration < 2:
            risk_score += 10
            indicators.append("Very short audio sample")

        elif duration < 4:
            risk_score += 5

        # Very low ZCR can indicate limited acoustic variation.
        if zero_crossing_rate < 0.02:
            risk_score += 15
            indicators.append(
                "Very low voice-frequency variation"
            )

        elif zero_crossing_rate < 0.03:
            risk_score += 8
            indicators.append(
                "Low voice-frequency variation"
            )

        # Spectral characteristics.
        if average_centroid < 150:
            risk_score += 15
            indicators.append(
                "Very unusual spectral characteristics"
            )

        elif average_centroid < 250:
            risk_score += 7
            indicators.append(
                "Unusual spectral characteristics"
            )

        # Energy variation.
        if energy_variation < 0.003:
            risk_score += 20
            indicators.append(
                "Very low natural energy variation"
            )

        elif energy_variation < 0.01:
            risk_score += 10
            indicators.append(
                "Low natural energy variation"
            )

        # Extremely low energy.
        if average_energy < 0.005:
            risk_score += 15
            indicators.append(
                "Extremely low audio energy"
            )

        elif average_energy < 0.02:
            risk_score += 7
            indicators.append(
                "Low audio energy"
            )

        # Keep score between 0 and 100.
        risk_score = min(round(risk_score), 100)

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

    finally:

        if (
            converted_audio_path
            and os.path.exists(converted_audio_path)
        ):
            os.remove(converted_audio_path)


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