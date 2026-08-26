// ============================================================
// TrustGuard AI
// AI-POWERED DIGITAL SCAM + VOICE IMPERSONATION DETECTION
// ============================================================

"use strict";

// ============================================================
// CONFIGURATION
// ============================================================

const API_BASE_URL = "https://trustguard-ai-zbkz.onrender.com";

const MESSAGE_ENDPOINT = `${API_BASE_URL}/analyze`;
const VOICE_ENDPOINT = `${API_BASE_URL}/analyze-voice`;
const MAX_VOICE_FILE_SIZE = 25 * 1024 * 1024;


// ============================================================
// GLOBAL STATE
// ============================================================

let messagesScanned = 0;
let voiceScans = 0;
let threatsDetected = 0;

let currentRiskScore = 0;
let currentRiskLevel = "LOW";

let liveProtectionActive = false;
let backendOnline = false;

let lastMessageResult = null;
let lastVoiceResult = null;

let scanHistory = [];


// ============================================================
// DOM HELPERS
// ============================================================

function getElement(id) {
    return document.getElementById(id);
}

function setText(id, value) {
    const element = getElement(id);

    if (element) {
        element.textContent = value;
    }
}

function showElement(id) {
    const element = getElement(id);

    if (element) {
        element.classList.remove("hidden");
    }
}

function hideElement(id) {
    const element = getElement(id);

    if (element) {
        element.classList.add("hidden");
    }
}


// ============================================================
// SECURITY HELPERS
// ============================================================

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = String(text ?? "");
    return div.innerHTML;
}

function normalizeScore(score) {
    let value = Number(score);

    if (!Number.isFinite(value)) {
        return 0;
    }

    value = Math.round(value);

    return Math.max(0, Math.min(100, value));
}

function getRiskLevel(score) {
    score = normalizeScore(score);

    if (score >= 70) {
        return "HIGH";
    }

    if (score >= 40) {
        return "MEDIUM";
    }

    return "LOW";
}
function getRiskClassName(level) {
    level = String(level || "LOW").toUpperCase();

    if (level === "HIGH") {
        return "high-risk";
    }

    if (level === "MEDIUM") {
        return "medium-risk";
    }

    return "low-risk";
}

function getRiskEmoji(level) {
    level = String(level || "LOW").toUpperCase();

    if (level === "HIGH") {
        return "🔴";
    }

    if (level === "MEDIUM") {
        return "🟠";
    }

    return "🟢";
}

function setRiskClass(element, level) {
    if (!element) {
        return;
    }

    element.classList.remove(
        "risk-low",
        "risk-medium",
        "risk-high",
        "low-risk",
        "medium-risk",
        "high-risk"
    );

    level = String(level || "LOW").toUpperCase();

    if (level === "HIGH") {
        element.classList.add("risk-high", "high-risk");
    } else if (level === "MEDIUM") {
        element.classList.add("risk-medium", "medium-risk");
    } else {
        element.classList.add("risk-low", "low-risk");
    }
}


// ============================================================
// DASHBOARD
// ============================================================

function updateDashboard() {
    setText("messagesScanned", messagesScanned);
    setText("voiceScans", voiceScans);
    setText("threatsDetected", threatsDetected);

    const riskElement = getElement("currentRisk");

    if (riskElement) {
        riskElement.textContent = currentRiskLevel;
        setRiskClass(riskElement, currentRiskLevel);
    }

    updateRiskMeter();
}


// ============================================================
// UNIFIED RISK
// ============================================================

function updateUnifiedRisk() {
    const messageScore = lastMessageResult
        ? normalizeScore(lastMessageResult.risk_score)
        : 0;

    const voiceScore = lastVoiceResult
        ? normalizeScore(lastVoiceResult.risk_score)
        : 0;

    // Use the highest detected threat
    currentRiskScore = Math.max(messageScore, voiceScore);

    currentRiskLevel = getRiskLevel(currentRiskScore);

    updateDashboard();

    // Keep risk meter synchronized
    updateRiskMeter(
        currentRiskScore,
        currentRiskLevel
    );

    console.log("Unified Risk:", {
        messageScore,
        voiceScore,
        finalScore: currentRiskScore,
        finalLevel: currentRiskLevel
    });
}

// ============================================================
// RISK METER
// ============================================================

function updateRiskMeter(score = currentRiskScore, level = currentRiskLevel) {
    score = normalizeScore(score);
    level = String(level || getRiskLevel(score)).toUpperCase();

    const meter = getElement("threatRiskMeter");
    const meterValue = getElement("threatRiskValue");
    const meterLabel = getElement("threatRiskLabel");

    if (meter) {
        meter.style.width = `${score}%`;

        meter.classList.remove(
            "low-risk",
            "medium-risk",
            "high-risk"
        );

        if (level === "HIGH") {
            meter.classList.add("high-risk");
        } else if (level === "MEDIUM") {
            meter.classList.add("medium-risk");
        } else {
            meter.classList.add("low-risk");
        }
    }

    if (meterValue) {
        meterValue.textContent = `${score}/100`;
    }

    if (meterLabel) {
        meterLabel.textContent =
            `${getRiskEmoji(level)} ${level} RISK`;
    }
}


// ============================================================
// HISTORY
// ============================================================

function addToHistory(type, score, level, details) {
    scanHistory.unshift({
        id: Date.now(),
        type: type,
        score: normalizeScore(score),
        level: level,
        details: details,
        time: new Date().toLocaleTimeString()
    });

    if (scanHistory.length > 20) {
        scanHistory = scanHistory.slice(0, 20);
    }

    console.log("TrustGuard AI History:", scanHistory);
}


// ============================================================
// BACKEND CHECK
// ============================================================

async function checkBackendConnection() {
    try {
        const response = await fetch(API_BASE_URL, {
            method: "GET"
        });

        backendOnline = response.ok;
    } catch (error) {
        backendOnline = false;

        console.warn(
            "Backend connection failed:",
            error.message
        );
    }

    return backendOnline;
}


// ============================================================
// LOCAL MESSAGE SCAM DETECTOR
// ============================================================

// ============================================================
// LOCAL MESSAGE SCAM DETECTOR
// ============================================================

function localMessageRiskDetector(message) {

    const text = String(message || "")
        .toLowerCase()
        .trim();

    let score = 0;
    const indicators = [];

    function addRisk(points, indicator, pattern) {

        if (pattern.test(text)) {

            score += points;

            if (!indicators.includes(indicator)) {
                indicators.push(indicator);
            }
        }
    }

    if (!text) {
        return {
            score: 0,
            level: "LOW",
            indicators: [],
            recommendation:
                "Please enter a message to analyze."
        };
    }


    // ========================================================
    // OTP
    // ========================================================

    const hasOTP =
        /\b(otp|one[\s-]?time[\s-]?password|verification[\s-]?code|security[\s-]?code|passcode|authentication[\s-]?code)\b/i
            .test(text);

    if (hasOTP) {

        score += 30;

        indicators.push(
            "OTP or verification-code request"
        );
    }


    // ========================================================
    // URGENCY
    // ========================================================

    addRisk(
        25,
        "Urgency or pressure",
        /\b(urgent|urgently|immediately|hurry|asap|right now|act now|quickly|last warning|final warning)\b/i
    );


    // ========================================================
    // BANKING
    // ========================================================

    const hasBanking =
        /\b(bank|bank account|credit card|debit card|atm|upi|transaction|payment|net banking|mobile banking|financial)\b/i
            .test(text);

    if (hasBanking) {

        score += 20;

        indicators.push(
            "Banking or financial content"
        );
    }


    // ========================================================
    // KYC
    // ========================================================

    addRisk(
        20,
        "KYC or account-verification request",
        /\b(kyc|e-kyc|kyc update|kyc verification|verify your account|account verification|verification required)\b/i
    );


    // ========================================================
    // PASSWORD / PIN / CVV
    // ========================================================

    addRisk(
        30,
        "Request for sensitive credentials",
        /\b(password|passcode|pin|cvv|card number|credentials|login details|username)\b/i
    );


    // ========================================================
    // MONEY / PAYMENT
    // ========================================================

    addRisk(
        25,
        "Money or payment request",
        /\b(send money|transfer money|pay now|payment required|refund|cashback|prize money|lottery|won money|processing fee|verification fee|delivery fee)\b/i
    );


    // ========================================================
    // ACCOUNT BLOCKING
    // ========================================================

    addRisk(
        25,
        "Account-blocking or suspension threat",
        /\b(account.*(blocked|suspended|locked|disabled)|blocked.*account|suspend.*account|account.*expire|account.*deactivate)\b/i
    );


    // ========================================================
    // SUSPICIOUS LINKS
    // ========================================================

    addRisk(
        20,
        "Suspicious link or redirection request",
        /(https?:\/\/|www\.|bit\.ly|tinyurl|t\.co|click here|open this link|verify here)/i
    );


    // ========================================================
    // PERSONAL INFORMATION
    // ========================================================

    addRisk(
        20,
        "Request for personal information",
        /\b(aadhaar|aadhar|pan card|date of birth|dob|phone number|address|personal information|identity|id proof)\b/i
    );


    // ========================================================
    // IMPERSONATION
    // ========================================================

    addRisk(
        25,
        "Possible impersonation attempt",
        /\b(this is your (bank|manager|boss|friend|relative)|i am your (friend|brother|sister|manager|boss)|calling from (bank|police|government)|police officer|income tax officer|customer care)\b/i
    );


    // ========================================================
    // PRIZE / REWARD
    // ========================================================

    addRisk(
        20,
        "Prize or reward-related claim",
        /\b(congratulations|you won|winner|lottery|lucky winner|free prize|cash prize|claim your prize|reward)\b/i
    );


    // ========================================================
    // PARCEL / DELIVERY
    // ========================================================

    const hasParcel =
        /\b(parcel|package|courier|delivery|shipment|shipping|delivery agent|delivery boy|consignment|customs)\b/i
            .test(text);

    if (hasParcel) {

        score += 15;

        indicators.push(
            "Parcel or delivery-related content"
        );
    }


    // ========================================================
    // PARCEL CANCELLATION
    // ========================================================

    const hasParcelCancellation =
        /\b(parcel|package|delivery|shipment|courier).{0,50}(cancelled|canceled|cancel|stopped|returned)\b/i
            .test(text)
        ||
        /\b(cancelled|canceled|cancel|stopped|returned).{0,50}(parcel|package|delivery|shipment|courier)\b/i
            .test(text);

    if (hasParcelCancellation) {

        score += 25;

        indicators.push(
            "Parcel cancellation or delivery threat"
        );
    }


    // ========================================================
    // OTP + PARCEL
    // ========================================================

    if (hasOTP && hasParcel) {

        score += 25;

        indicators.push(
            "OTP request combined with parcel/delivery content"
        );
    }


    // ========================================================
    // OTP + PARCEL CANCELLATION
    // VERY HIGH-RISK PATTERN
    // ========================================================

    if (
        hasOTP &&
        hasParcel &&
        hasParcelCancellation
    ) {

        score += 30;

        indicators.push(
            "OTP request linked to parcel cancellation"
        );
    }


    // ========================================================
    // CALL + SENSITIVE REQUEST
    // ========================================================

    const hasCallRequest =
        /\b(call me|call back|can i call|calling you|phone call|call urgently|i will call)\b/i
            .test(text);

    const hasSensitiveRequest =
        hasOTP ||
        /\b(password|pin|cvv|credentials|send money|transfer money|pay now)\b/i
            .test(text);

    if (
        hasCallRequest &&
        hasSensitiveRequest
    ) {

        score += 20;

        indicators.push(
            "Call request combined with a sensitive request"
        );
    }


    // ========================================================
    // MULTIPLE SUSPICIOUS SIGNALS
    // ========================================================

    let strongSignals = 0;

    if (hasOTP) {
        strongSignals++;
    }

    if (hasParcel) {
        strongSignals++;
    }

    if (hasParcelCancellation) {
        strongSignals++;
    }

    if (hasBanking) {
        strongSignals++;
    }

    if (
        /\b(password|pin|cvv|credentials|card number)\b/i
            .test(text)
    ) {
        strongSignals++;
    }

    if (
        /\b(send money|transfer money|pay now|payment required)\b/i
            .test(text)
    ) {
        strongSignals++;
    }


    if (strongSignals >= 3) {

        score += 25;

        indicators.push(
            "Multiple suspicious characteristics detected"
        );
    }


    // ========================================================
    // FORCE HIGH RISK FOR OTP + PARCEL CANCELLATION
    // ========================================================

    if (
        hasOTP &&
        hasParcel &&
        hasParcelCancellation
    ) {

        score = Math.max(score, 80);
    }


    // ========================================================
    // LIMIT SCORE
    // ========================================================

    score = Math.min(score, 100);


    // ========================================================
    // RISK LEVEL
    // ========================================================

    const level = getRiskLevel(score);


    // ========================================================
    // RECOMMENDATION
    // ========================================================

    let recommendation;

    if (level === "HIGH") {

        recommendation =
            "HIGH RISK! Do not click links, share OTPs, passwords, PINs, CVVs, transfer money, or provide sensitive information. Verify the sender through an official channel.";

    } else if (level === "MEDIUM") {

        recommendation =
            "MEDIUM RISK. The message contains suspicious characteristics. Verify the sender before sharing information, clicking links, or making payments.";

    } else {

        recommendation =
            "LOW RISK. No major scam indicators were detected. However, remain cautious with unexpected requests.";
    }


    // ========================================================
    // RETURN RESULT
    // ========================================================

    return {

        score: score,

        level: level,

        indicators: indicators,

        recommendation: recommendation
    };
}

// ============================================================
// WHY WAS THIS DETECTED?
// ============================================================

function getIndicatorExplanation(indicator) {

    const explanations = {
        "OTP or verification-code request":
            "The message asks for an OTP or verification code. Legitimate organizations generally do not ask you to disclose your OTP.",

        "Urgency or pressure":
            "The message creates pressure to act immediately. Scammers commonly use urgency to prevent careful verification.",

        "Banking or financial content":
            "The message involves banking, cards, payments, UPI, or financial activity.",

        "KYC or account-verification request":
            "The message uses KYC or account verification as a reason to request action or information.",

        "Request for sensitive credentials":
            "The message appears to request passwords, PINs, CVVs, login information, or other sensitive credentials.",

        "Money or payment request":
            "The sender appears to request money, payment, transfer, refund processing, or another financial action.",

        "Account-blocking or suspension threat":
            "The message threatens that an account will be blocked, suspended, locked, or disabled.",

        "Suspicious link or redirection request":
            "The message contains a link or asks you to click, open, or verify something through a link.",

        "Request for personal information":
            "The message appears to request personal or identity information.",

        "Possible impersonation attempt":
            "The message contains language commonly associated with someone pretending to be another person or organization.",

        "Prize or reward-related claim":
            "The message claims that you have won a prize, lottery, reward, or cash benefit.",

        "Call request combined with a sensitive request":
            "The message combines a call request with an OTP, credential, money, or other sensitive request."
    };

    return explanations[indicator] ||
        "This indicator contributed to the overall risk assessment.";
}


function buildWhyDetectedItems(indicators) {

    if (!Array.isArray(indicators) || indicators.length === 0) {
        return `
            <li>
                No strong suspicious indicators were detected.
            </li>
        `;
    }

    return indicators.map(indicator => `
        <li>
            <strong>${escapeHtml(indicator)}</strong>
            <br>
            <span>${escapeHtml(
                getIndicatorExplanation(indicator)
            )}</span>
        </li>
    `).join("");
}


function showWhyDetected(indicators, type = "MESSAGE") {

    const existing = getElement("whyDetected");

    if (existing) {
        existing.innerHTML = `
            <h3>🧠 Why was this detected?</h3>

            <p>
                TrustGuard AI identified the following
                characteristics in this ${escapeHtml(
                    type.toLowerCase()
                )}:
            </p>

            <ul>
                ${buildWhyDetectedItems(indicators)}
            </ul>
        `;

        existing.classList.remove("hidden");
        return;
    }

    // If the HTML does not already contain the element,
    // create it automatically.

    const result =
        type === "VOICE"
            ? getElement("voiceResult")
            : getElement("result");

    if (!result) {
        return;
    }

    const box = document.createElement("div");

    box.id = "whyDetected";

    box.className = "why-detected";

    box.innerHTML = `
        <h3>🧠 Why was this detected?</h3>

        <p>
            TrustGuard AI identified the following
            characteristics in this ${escapeHtml(
                type.toLowerCase()
            )}:
        </p>

        <ul>
            ${buildWhyDetectedItems(indicators)}
        </ul>
    `;

    result.appendChild(box);
}


// ============================================================
// RISK SUMMARY PANEL
// ============================================================

function createRiskSummary(score, level, type = "MESSAGE") {

    const container =
        type === "VOICE"
            ? getElement("voiceResult")
            : getElement("result");

    if (!container) {
        return;
    }

    let summary =
        getElement("riskSummary");

    if (!summary) {
        summary = document.createElement("div");
        summary.id = "riskSummary";
        summary.className = "risk-summary";

        container.prepend(summary);
    }

    const safeLevel =
        String(level || "LOW").toUpperCase();

    summary.innerHTML = `
        <h3>🛡️ Threat Risk Assessment</h3>

        <div class="risk-meter-container">
            <div
                id="threatRiskMeter"
                class="threat-risk-meter ${getRiskClassName(
                    safeLevel
                )}"
                style="width:${normalizeScore(score)}%"
            ></div>
        </div>

        <div class="risk-meter-info">
            <strong id="threatRiskLabel">
                ${getRiskEmoji(safeLevel)}
                ${escapeHtml(safeLevel)} RISK
            </strong>

            <strong id="threatRiskValue">
                ${normalizeScore(score)}/100
            </strong>
        </div>

        <p class="risk-explanation">
            ${
                safeLevel === "HIGH"
                    ? "Strong scam or impersonation indicators were detected. Avoid responding and independently verify the sender or caller."
                    : safeLevel === "MEDIUM"
                    ? "Some suspicious characteristics were detected. Verify the sender or caller before sharing sensitive information."
                    : "No major suspicious indicators were detected, but unexpected requests should still be verified."
            }
        </p>
    `;
}


// ============================================================
// COMBINE BACKEND + LOCAL DETECTION
// ============================================================

function mergeMessageRisk(backendData, message) {

    const local =
        localMessageRiskDetector(message);

    const backendScore =
        normalizeScore(
            backendData?.risk_score ?? 0
        );

    const finalScore =
        Math.max(
            backendScore,
            local.score
        );

    let finalLevel =
        getRiskLevel(finalScore);

    const backendLevel =
        String(
            backendData?.risk_level || ""
        ).toUpperCase();

    if (backendLevel === "HIGH") {
        finalLevel = "HIGH";
    } else if (
        backendLevel === "MEDIUM" &&
        finalScore < 40
    ) {
        finalLevel = "MEDIUM";
    }

    const backendIndicators =
        Array.isArray(
            backendData?.detected_indicators
        )
            ? backendData.detected_indicators
            : [];

    const indicators = [
        ...backendIndicators,
        ...local.indicators
    ].filter(
        (item, index, array) =>
            item &&
            array.indexOf(item) === index
    );

    let recommendation =
        backendData?.recommendation ||
        getMessageRecommendation(finalLevel);

    if (local.score > backendScore) {
        recommendation = local.recommendation;
    }

    return {
        risk_score: finalScore,
        risk_level: finalLevel,
        detected_indicators: indicators,
        recommendation: recommendation
    };
}


// ============================================================
// MESSAGE RECOMMENDATION
// ============================================================

function getMessageRecommendation(level) {

    level =
        String(level)
            .toUpperCase();

    if (level === "HIGH") {
        return (
            "HIGH RISK! Do not click links, " +
            "share OTPs, transfer money, " +
            "or provide sensitive information. " +
            "Verify through an official channel."
        );
    }

    if (level === "MEDIUM") {
        return (
            "MEDIUM RISK. Be cautious and " +
            "verify the sender before sharing " +
            "personal or financial information."
        );
    }

    return (
        "LOW RISK. No major suspicious " +
        "indicators were detected. " +
        "Continue to remain cautious."
    );
}


// ============================================================
// MESSAGE ANALYSIS
// ============================================================

async function analyzeMessage() {

    const messageElement =
        getElement("message");

    if (!messageElement) {
        alert(
            "Message input was not found. " +
            "Please check index.html."
        );

        return;
    }

    const message =
        messageElement.value.trim();

    if (!message) {
        alert(
            "Please enter or paste a suspicious message first."
        );

        messageElement.focus();

        return;
    }

    const result =
        getElement("result");

    const scoreElement =
        getElement("score");

    const levelElement =
        getElement("level");

    const indicatorsElement =
        getElement("indicators");

    const recommendationElement =
        getElement("recommendation");

    showElement("result");

    setText("score", "...");
    setText("level", "ANALYZING...");

    if (indicatorsElement) {
        indicatorsElement.innerHTML =
            "<li>🧠 TrustGuard AI is analyzing the message...</li>";
    }

    if (recommendationElement) {
        recommendationElement.textContent =
            "Checking urgency, OTP requests, banking content, suspicious links and other scam indicators...";
    }

    const button =
        document.querySelector(
            'button[onclick="analyzeMessage()"]'
        );

    const originalButtonText =
        button ? button.textContent : "";

    if (button) {
        button.disabled = true;
        button.textContent =
            "🧠 AI Analyzing...";
    }

    try {

        let data = {};
        let backendSucceeded = false;

        // ----------------------------------------------------
        // BACKEND
        // ----------------------------------------------------

        try {

            const response =
                await fetch(
                    MESSAGE_ENDPOINT,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                text: message
                            })
                    }
                );

            const rawText =
                await response.text();

            if (rawText) {
                try {
                    data =
                        JSON.parse(rawText);
                } catch {
                    data = {};
                }
            }

            if (response.ok) {
                backendSucceeded = true;
            }

        } catch (backendError) {

            console.warn(
                "Backend unavailable. Using local detector.",
                backendError
            );
        }

        // ----------------------------------------------------
        // COMBINED RESULT
        // ----------------------------------------------------

        const mergedResult =
            mergeMessageRisk(
                data,
                message
            );

        const riskScore =
            normalizeScore(
                mergedResult.risk_score
            );

        const riskLevel =
            mergedResult.risk_level;

        const indicators =
            mergedResult.detected_indicators;

        // ----------------------------------------------------
        // COUNTERS
        // ----------------------------------------------------

        messagesScanned++;

        if (riskScore >= 40) {
            threatsDetected++;
        }

        // ----------------------------------------------------
        // SAVE RESULT
        // ----------------------------------------------------

        lastMessageResult = {
            risk_score: riskScore,
            risk_level: riskLevel,
            message: message,
            indicators: indicators,
            recommendation:
                mergedResult.recommendation
        };

        addToHistory(
            "MESSAGE",
            riskScore,
            riskLevel,
            message
        );

        // ----------------------------------------------------
        // DISPLAY SCORE
        // ----------------------------------------------------

        setText("score", riskScore);

        if (levelElement) {
            levelElement.textContent =
                riskLevel;

            setRiskClass(
                levelElement,
                riskLevel
            );
        }

        // ----------------------------------------------------
        // DISPLAY INDICATORS
        // ----------------------------------------------------

        if (indicatorsElement) {

            indicatorsElement.innerHTML = "";

            if (indicators.length === 0) {

                const li =
                    document.createElement("li");

                li.textContent =
                    "No strong suspicious indicators detected.";

                indicatorsElement.appendChild(li);

            } else {

                indicators.forEach(indicator => {

                    const li =
                        document.createElement("li");

                    li.textContent =
                        indicator;

                    indicatorsElement.appendChild(li);
                });
            }
        }

        // ----------------------------------------------------
        // RECOMMENDATION
        // ----------------------------------------------------

        if (recommendationElement) {
            recommendationElement.textContent =
                mergedResult.recommendation;
        }

        // ----------------------------------------------------
        // NEW RISK SUMMARY
        // ----------------------------------------------------

        createRiskSummary(
            riskScore,
            riskLevel,
            "MESSAGE"
        );

        showWhyDetected(
            indicators,
            "MESSAGE"
        );

        // ----------------------------------------------------
        // INCOMING COMMUNICATION
        // ----------------------------------------------------

        showElement("incomingCard");

        setText(
            "incomingMessage",
            message
        );

        setText(
            "analysisStatus",
            `🧠 Analysis complete: ${getRiskEmoji(
                riskLevel
            )} ${riskLevel} RISK`
        );

        // ----------------------------------------------------
        // THREAT ALERT
        // ----------------------------------------------------

        if (riskScore >= 40) {

            showThreatAlert(
                message,
                riskScore,
                riskLevel,
                "MESSAGE"
            );

        } else {

            hideElement("threatAlert");
        }

        // ----------------------------------------------------
        // DASHBOARD
        // ----------------------------------------------------

        updateUnifiedRisk();

        

        // ----------------------------------------------------
        // SCROLL
        // ----------------------------------------------------

        if (result) {

            setTimeout(() => {

                result.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }, 200);
        }

        console.log(
            "Message analysis completed.",
            {
                backendUsed: backendSucceeded,
                score: riskScore,
                level: riskLevel,
                indicators: indicators
            }
        );

    } catch (error) {

        console.error(
            "MESSAGE ANALYSIS ERROR:",
            error
        );

        // ----------------------------------------------------
        // FALLBACK
        // ----------------------------------------------------

        const fallback =
            localMessageRiskDetector(
                message
            );

        setText(
            "score",
            fallback.score
        );

        setText(
            "level",
            fallback.level
        );

        if (levelElement) {
            setRiskClass(
                levelElement,
                fallback.level
            );
        }

        if (indicatorsElement) {

            indicatorsElement.innerHTML = "";

            if (
                fallback.indicators.length === 0
            ) {

                indicatorsElement.innerHTML =
                    "<li>No strong suspicious indicators detected.</li>";

            } else {

                fallback.indicators.forEach(
                    indicator => {

                        const li =
                            document.createElement("li");

                        li.textContent =
                            indicator;

                        indicatorsElement.appendChild(li);
                    }
                );
            }
        }

        if (recommendationElement) {
            recommendationElement.textContent =
                fallback.recommendation;
        }

        messagesScanned++;

        if (fallback.score >= 40) {
            threatsDetected++;
        }

        lastMessageResult = {
            risk_score: fallback.score,
            risk_level: fallback.level,
            message: message,
            indicators: fallback.indicators,
            recommendation:
                fallback.recommendation
        };

        createRiskSummary(
            fallback.score,
            fallback.level,
            "MESSAGE"
        );

        showWhyDetected(
            fallback.indicators,
            "MESSAGE"
        );

        updateUnifiedRisk();

        showElement("incomingCard");

        setText(
            "incomingMessage",
            message
        );

        setText(
            "analysisStatus",
            `🧠 Analysis complete: ${getRiskEmoji(
                fallback.level
            )} ${fallback.level} RISK`
        );

        if (fallback.score >= 40) {

            showThreatAlert(
                message,
                fallback.score,
                fallback.level,
                "MESSAGE"
            );
        }

    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                originalButtonText ||
                "🔎 Analyze Message";
        }
    }
}


// ============================================================
// LIVE PROTECTION
// ============================================================

function startLiveProtection() {

    liveProtectionActive =
        !liveProtectionActive;

    const liveStatus =
        getElement("liveStatus");

    const button =
        document.querySelector(
            'button[onclick="startLiveProtection()"]'
        );

    if (liveProtectionActive) {

        showElement("liveStatus");

        if (button) {
            button.textContent =
                "🛡️ Live Protection Active";
        }

        if (liveStatus) {

            liveStatus.innerHTML = `
                <span class="status-dot"></span>

                <strong>
                    LIVE PROTECTION ACTIVE
                </strong>

                <p>
                    ThreatTrackers is monitoring
                    incoming communications.
                </p>
            `;
        }

        // Demo communication for prototype
        const demoMessage =
            "URGENT! Your bank account will be blocked. " +
            "Send your OTP immediately to complete KYC.";

        showElement("incomingCard");

        setText(
            "incomingMessage",
            demoMessage
        );

        setText(
            "analysisStatus",
            "🧠 Analyzing incoming communication..."
        );

        setTimeout(() => {

            if (liveProtectionActive) {
                analyzeLiveMessage(
                    demoMessage
                );
            }

        }, 1000);

    } else {

        hideElement("liveStatus");

        if (button) {
            button.textContent =
                "🛡️ Start Live Protection";
        }
    }
}


// ============================================================
// LIVE MESSAGE ANALYSIS
// ============================================================

async function analyzeLiveMessage(message) {

    try {

        let data = {};

        try {

            const response =
                await fetch(
                    MESSAGE_ENDPOINT,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                text: message
                            })
                    }
                );

            const rawText =
                await response.text();

            if (rawText) {
                try {
                    data =
                        JSON.parse(rawText);
                } catch {
                    data = {};
                }
            }

        } catch {
            data = {};
        }

        const mergedResult =
            mergeMessageRisk(
                data,
                message
            );

        const score =
            mergedResult.risk_score;

        const level =
            mergedResult.risk_level;

        messagesScanned++;

        if (score >= 40) {
            threatsDetected++;
        }

        currentRiskScore = score;
        currentRiskLevel = level;

        lastMessageResult = {
            risk_score: score,
            risk_level: level,
            message: message,
            indicators:
                mergedResult.detected_indicators,
            recommendation:
                mergedResult.recommendation
        };

        addToHistory(
            "LIVE MESSAGE",
            score,
            level,
            message
        );

        updateUnifiedRisk();

        setText(
            "analysisStatus",
            `🧠 Analysis complete: ${getRiskEmoji(
                level
            )} ${level} RISK`
        );

        if (score >= 40) {

            showThreatAlert(
                message,
                score,
                level,
                "LIVE COMMUNICATION"
            );
        }

    } catch (error) {

        console.error(
            "LIVE PROTECTION ERROR:",
            error
        );

        setText(
            "analysisStatus",
            "❌ Unable to analyze incoming communication."
        );
    }
}


// ============================================================
// THREAT ALERT
// ============================================================

function showThreatAlert(
    message,
    score,
    level,
    type = "MESSAGE"
) {

    const threatAlert =
        getElement("threatAlert");

    const threatMessage =
        getElement("threatMessage");

    if (!threatAlert) {
        return;
    }

    showElement("threatAlert");

    if (threatMessage) {

        threatMessage.innerHTML = `

            <strong>
                Communication Type:
            </strong>

            ${escapeHtml(type)}

            <br><br>

            <strong>
                Risk Level:
            </strong>

            <span class="${getRiskClassName(level)}">
                ${escapeHtml(level)}
            </span>

            <br>

            <strong>
                Risk Score:
            </strong>

            ${normalizeScore(score)}/100

            <br><br>

            <strong>
                Message:
            </strong>

            <br>

            ${escapeHtml(message)}

        `;
    }
}


// ============================================================
// VIEW THREAT DETAILS
// ============================================================

function viewThreatDetails() {

    const result =
        getElement("result");

    if (result) {

        showElement("result");

        result.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }
}


// ============================================================
// BLOCK THREAT
// ============================================================

function blockThreat() {

    alert(
        "🛑 THREAT BLOCKED\n\n" +
        "Do not respond.\n" +
        "Do not click suspicious links.\n" +
        "Do not share OTPs or passwords.\n" +
        "Do not transfer money.\n\n" +
        "Verify the sender through an official channel."
    );

    hideElement("threatAlert");

    setText(
        "analysisStatus",
        "🛑 Threat blocked. Do not respond."
    );
}


// ============================================================
// DISMISS THREAT
// ============================================================

function dismissThreat() {

    hideElement("threatAlert");

    setText(
        "analysisStatus",
        "Threat alert dismissed. Stay cautious."
    );
}


// ============================================================
// VOICE ANALYSIS
// ============================================================

async function analyzeVoice() {

    const fileInput =
        getElement("voiceFile");

    if (!fileInput && !recordedVoiceFile) {
        alert("Voice file input was not found.");
        return;
    }

    const file =
        (fileInput &&
         fileInput.files &&
         fileInput.files.length > 0)
            ? fileInput.files[0]
            : recordedVoiceFile;

    if (!file) {
        alert(
            "Please upload a voice recording or record your voice first."
        );
        return;
    }

        

    if (file.size > MAX_VOICE_FILE_SIZE) {
        alert(
            "Voice file is too large.\n\nMaximum allowed size is 25 MB."
        );
        return;
    }
    

   const fileName =
    file.name.toLowerCase();

const allowedExtensions = [
    ".wav",
    ".mp3",
    ".ogg",
    ".flac",
    ".webm"
];

const validExtension =
    allowedExtensions.some(
        extension =>
            fileName.endsWith(extension)
    );

if (!validExtension) {

    alert(
        "Please select a WAV, MP3, OGG, FLAC, or WEBM file."
    );

    return;
}
    const voiceResult =
        getElement("voiceResult");

    const voiceStatus =
        getElement("voiceStatus");

    const voiceDuration =
        getElement("voiceDuration");

    const voiceEnergy =
        getElement("voiceEnergy");

    const voiceZcr =
        getElement("voiceZcr");

    const voiceCentroid =
        getElement("voiceCentroid");

    const voiceRiskLevel =
        getElement("voiceRiskLevel");

    const voiceIndicatorList =
        getElement("voiceIndicatorList");

    const voiceWarning =
        getElement("voiceWarning");

    showElement("voiceResult");

    setText(
        "voiceStatus",
        "Analyzing..."
    );

    setText(
        "voiceDuration",
        "--"
    );

    setText(
        "voiceEnergy",
        "--"
    );

    setText(
        "voiceZcr",
        "--"
    );

    setText(
        "voiceCentroid",
        "--"
    );

    setText(
        "voiceRiskScore",
        "--"
    );

    setText(
        "voiceRiskLevel",
        "--"
    );

    if (voiceIndicatorList) {
        voiceIndicatorList.innerHTML =
            "<li>🧠 Extracting acoustic features...</li>";
    }

    if (voiceWarning) {
        voiceWarning.innerHTML = "";
    }

    const button =
        document.querySelector(
            'button[onclick="analyzeVoice()"]'
        );

    const originalButtonText =
        button ? button.textContent : "";

    if (button) {
        button.disabled = true;
        button.textContent =
            "🧠 Analyzing Voice...";
    }

    const formData =
        new FormData();

    formData.append(
        "file",
        file
    );

    try {

        const response =
            await fetch(
                VOICE_ENDPOINT,
                {
                    method: "POST",
                    body: formData
                }
            );

        const rawText =
            await response.text();

        let data = {};

        try {

            data =
                rawText
                    ? JSON.parse(rawText)
                    : {};

        } catch {

            throw new Error(
                `Invalid voice backend response. HTTP ${response.status}`
            );
        }

        if (!response.ok) {

            throw new Error(
                data.detail ||
                data.message ||
                `HTTP ${response.status}`
            );
        }

        if (
            data.status === "error"
        ) {

            throw new Error(
                data.message ||
                "Voice analysis failed."
            );
        }

        // ----------------------------------------------------
        // VOICE FEATURES
        // ----------------------------------------------------

        setText(
            "voiceStatus",
            data.status ||
            "success"
        );

        setText(
            "voiceDuration",
            data.duration_seconds ??
            "--"
        );

        setText(
            "voiceEnergy",
            data.average_energy ??
            "--"
        );

        setText(
            "voiceZcr",
            data.zero_crossing_rate ??
            "--"
        );

        setText(
            "voiceCentroid",
            data.spectral_centroid ??
            "--"
        );

        // ----------------------------------------------------
        // VOICE RISK
        // ----------------------------------------------------

        const riskScore =
            normalizeScore(
                data.impersonation_risk_score
            );

        const riskLevel =
            String(
                data.risk_level ||
                getRiskLevel(riskScore)
            ).toUpperCase();

        const indicators =
            Array.isArray(data.indicators)
                ? data.indicators
                : [];

        // ----------------------------------------------------
        // SAVE
        // ----------------------------------------------------

        lastVoiceResult = {
            risk_score: riskScore,
            risk_level: riskLevel,
            file: file.name,
            indicators: indicators
        };

        // ----------------------------------------------------
        // DISPLAY SCORE
        // ----------------------------------------------------

        setText(
            "voiceRiskScore",
            riskScore
        );

        if (voiceRiskLevel) {

            voiceRiskLevel.textContent =
                riskLevel;

            setRiskClass(
                voiceRiskLevel,
                riskLevel
            );
        }

        // ----------------------------------------------------
        // INDICATORS
        // ----------------------------------------------------

        if (voiceIndicatorList) {

            voiceIndicatorList.innerHTML =
                "";

            if (indicators.length === 0) {

                const li =
                    document.createElement("li");

                li.textContent =
                    "No strong suspicious voice indicators detected.";

                voiceIndicatorList.appendChild(li);

            } else {

                indicators.forEach(
                    indicator => {

                        const li =
                            document.createElement("li");

                        li.textContent =
                            indicator;

                        voiceIndicatorList.appendChild(li);
                    }
                );
            }
        }

        // ----------------------------------------------------
        // WARNING
        // ----------------------------------------------------

        displayVoiceWarning(
            riskScore,
            riskLevel
        );

        // ----------------------------------------------------
        // NEW VOICE RISK SUMMARY
        // ----------------------------------------------------

        createVoiceRiskSummary(
            riskScore,
            riskLevel
        );

        showVoiceWhyDetected(
            indicators
        );

        // ----------------------------------------------------
        // COUNTERS
        // ----------------------------------------------------

        voiceScans++;

        if (riskScore >= 40) {
            threatsDetected++;
        }

        // ----------------------------------------------------
        // HISTORY
        // ----------------------------------------------------

        addToHistory(
            "VOICE",
            riskScore,
            riskLevel,
            file.name
        );

        // ----------------------------------------------------
        // DASHBOARD
        // ----------------------------------------------------

        updateUnifiedRisk();

        // ----------------------------------------------------
        // VOICE THREAT
        // ----------------------------------------------------

        if (riskScore >= 40) {

            showVoiceThreatAlert(
                file.name,
                riskScore,
                riskLevel,
                indicators
            );
        }

        // ----------------------------------------------------
        // SCROLL
        // ----------------------------------------------------

        if (voiceResult) {

            setTimeout(() => {

                voiceResult.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }, 200);
        }

    } catch (error) {

        console.error(
            "VOICE ANALYSIS ERROR:",
            error
        );

        if (voiceStatus) {
            voiceStatus.textContent =
                "Analysis failed";
        }

        if (voiceWarning) {

            voiceWarning.innerHTML = `

                <div class="voice-risk-high">

                    ❌
                    <strong>
                        VOICE ANALYSIS FAILED
                    </strong>

                    <p>
                        ${escapeHtml(
                            error.message
                        )}
                    </p>

                </div>

                <div class="voice-disclaimer">

                    Make sure FastAPI is running at:

                    <br>

                    <strong>
                        http://trustguard-ai-zbkz.onrender.com
                    </strong>

                </div>
            `;
        }

        alert(
            "Unable to analyze the voice.\n\n" +
            error.message +
            "\n\n" +
            "Make sure FastAPI is running at:\n" +
            API_BASE_URL
        );

    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                originalButtonText ||
                "🎙️ Analyze Voice";
        }
    }
}


// ============================================================
// VOICE RISK SUMMARY
// ============================================================

function createVoiceRiskSummary(score, level) {

    const container =
        getElement("voiceResult");

    if (!container) {
        return;
    }

    let summary =
        getElement("voiceRiskSummary");

    if (!summary) {

        summary =
            document.createElement("div");

        summary.id =
            "voiceRiskSummary";

        summary.className =
            "risk-summary";

        container.prepend(summary);
    }

    summary.innerHTML = `

        <h3>
            🛡️ Voice Impersonation Risk
        </h3>

        <div class="risk-meter-container">

            <div
                id="voiceThreatRiskMeter"
                class="threat-risk-meter ${getRiskClassName(
                    level
                )}"
                style="width:${normalizeScore(score)}%"
            ></div>

        </div>

        <div class="risk-meter-info">

            <strong>
                ${getRiskEmoji(level)}
                ${escapeHtml(level)} RISK
            </strong>

            <strong>
                ${normalizeScore(score)}/100
            </strong>

        </div>

        <p class="risk-explanation">

            ${
                level === "HIGH"
                    ? "The acoustic analysis indicates a high impersonation risk. Verify the caller through an independent channel."
                    : level === "MEDIUM"
                    ? "Some suspicious acoustic characteristics were detected. Verify the caller before sharing sensitive information."
                    : "No strong suspicious acoustic characteristics were detected. This does not guarantee that the caller is genuine."
            }

        </p>
    `;
}


function showVoiceWhyDetected(indicators) {

    const container =
        getElement("voiceResult");

    if (!container) {
        return;
    }

    let box =
        getElement("voiceWhyDetected");

    if (!box) {

        box =
            document.createElement("div");

        box.id =
            "voiceWhyDetected";

        box.className =
            "why-detected";

        container.appendChild(box);
    }

    if (
        !Array.isArray(indicators) ||
        indicators.length === 0
    ) {

        box.innerHTML = `
            <h3>
                🧠 Why was this detected?
            </h3>

            <p>
                No strong suspicious acoustic indicators
                were returned by the voice analysis.
            </p>
        `;

        return;
    }

    box.innerHTML = `

        <h3>
            🧠 Why was this detected?
        </h3>

        <p>
            The voice analysis returned these
            acoustic indicators:
        </p>

        <ul>

            ${indicators.map(indicator => `

                <li>
                    <strong>
                        ${escapeHtml(indicator)}
                    </strong>

                    <br>

                    <span>
                        This acoustic characteristic
                        contributed to the impersonation
                        risk assessment.
                    </span>
                </li>

            `).join("")}

        </ul>

        <p class="voice-disclaimer">
            ⚠️ Acoustic indicators alone cannot conclusively
            prove that a voice was generated or cloned by AI.
        </p>
    `;
}


// ============================================================
// VOICE WARNING
// ============================================================

function displayVoiceWarning(score, level) {

    const warning =
        getElement("voiceWarning");

    if (!warning) {
        return;
    }

    if (level === "HIGH") {

        warning.innerHTML = `

            <div class="voice-risk-high">

                🚨

                <strong>
                    HIGH IMPERSONATION RISK
                </strong>

                <p>
                    The recording contains suspicious
                    acoustic characteristics.
                </p>

                <p>
                    🛑 Verify the caller through
                    an independent communication channel.
                </p>

            </div>

            <div class="voice-disclaimer">

                ⚠️ Prototype acoustic-risk assessment.
                A trained anti-spoofing model is required
                to conclusively confirm an AI-generated
                or cloned voice.

            </div>
        `;

        return;
    }

    if (level === "MEDIUM") {

        warning.innerHTML = `

            <div class="voice-risk-medium">

                🟠

                <strong>
                    MEDIUM IMPERSONATION RISK
                </strong>

                <p>
                    Suspicious acoustic characteristics
                    were detected.
                    Verify the caller before sharing
                    sensitive information.
                </p>

            </div>

            <div class="voice-disclaimer">

                ⚠️ Prototype acoustic-risk assessment.
                This does not conclusively prove
                that the voice is AI-generated.

            </div>
        `;

        return;
    }

    warning.innerHTML = `

        <div class="voice-risk-low">

            🟢

            <strong>
                LOW IMPERSONATION RISK
            </strong>

            <p>
                No strong suspicious acoustic
                characteristics were detected.
            </p>

        </div>

        <div class="voice-disclaimer">

            ⚠️ Low risk does not guarantee
            that a caller is genuine.

        </div>
    `;
}


// ============================================================
// VOICE THREAT ALERT
// ============================================================

function showVoiceThreatAlert(
    fileName,
    score,
    level,
    indicators
) {

    const threatAlert =
        getElement("threatAlert");

    const threatMessage =
        getElement("threatMessage");

    if (!threatAlert) {
        return;
    }

    showElement("threatAlert");

    const indicatorText =
        indicators &&
        indicators.length > 0
            ? indicators.join(", ")
            : "No strong indicators detected.";

    if (threatMessage) {

        threatMessage.innerHTML = `

            <strong>
                Communication Type:
            </strong>

            Voice Recording

            <br><br>

            <strong>
                File:
            </strong>

            ${escapeHtml(fileName)}

            <br>

            <strong>
                Risk Level:
            </strong>

            <span class="${getRiskClassName(level)}">
                ${escapeHtml(level)}
            </span>

            <br>

            <strong>
                Risk Score:
            </strong>

            ${normalizeScore(score)}/100

            <br><br>

            <strong>
                Detected Indicators:
            </strong>

            <br>

            ${escapeHtml(indicatorText)}

            <br><br>

            <strong>
                Recommendation:
            </strong>

            <br>

            Verify the caller through
            an independent channel.
            Do not share sensitive information
            based only on the voice.

        `;
    }
}


// ============================================================
// DEMO THREAT
// ============================================================

function simulateThreat() {

    const demoMessage =
        "URGENT! Your bank account will be blocked. " +
        "Send your OTP immediately to complete KYC.";

    const messageInput =
        getElement("message");

    if (messageInput) {
        messageInput.value =
            demoMessage;
    }

    analyzeMessage();
}


// ============================================================
// QUICK MESSAGE TEST
// ============================================================

function testMessageDetector() {

    const input =
        getElement("message");

    if (!input) {

        console.warn(
            "Message input was not found."
        );

        return;
    }

    input.value =
        "URGENT! Your bank account will be blocked. Send your OTP immediately to complete KYC.";

    analyzeMessage();
}


// ============================================================
// RESET DASHBOARD
// ============================================================

function resetDashboard() {

    messagesScanned = 0;
    voiceScans = 0;
    threatsDetected = 0;

    currentRiskScore = 0;
    currentRiskLevel = "LOW";

    lastMessageResult = null;
    lastVoiceResult = null;

    scanHistory = [];

    hideElement("result");
    hideElement("incomingCard");
    hideElement("threatAlert");
    hideElement("voiceResult");

    updateDashboard();

    console.log(
        "TrustGuard AI dashboard reset."
    );
}


// ============================================================
// SECURITY SUMMARY
// ============================================================

function getSecuritySummary() {

    return {

        system:
            "TrustGuard AI",

        backend:
            backendOnline
                ? "ONLINE"
                : "UNKNOWN",

        live_protection:
            liveProtectionActive,

        messages_scanned:
            messagesScanned,

        voice_scans:
            voiceScans,

        threats_detected:
            threatsDetected,

        current_score:
            currentRiskScore,

        current_level:
            currentRiskLevel,

        history:
            scanHistory
    };
}


// ============================================================
// KEYBOARD SHORTCUT
// CTRL + ENTER = ANALYZE MESSAGE
// ============================================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.ctrlKey &&
            event.key === "Enter"
        ) {

            const message =
                getElement("message");

            if (
                message &&
                document.activeElement === message
            ) {

                event.preventDefault();

                analyzeMessage();
            }
        }
    }
);


// ============================================================
// FILE SELECTION
// ============================================================

document.addEventListener(
    "change",
    event => {

        if (
            event.target &&
            event.target.id === "voiceFile"
        ) {

            const file =
                event.target.files[0];

            if (!file) {
                return;
            }

            console.log(
                "Selected voice file:",
                file.name
            );

            console.log(
                "Size:",
                (
                    file.size /
                    1024 /
                    1024
                ).toFixed(2),
                "MB"
            );

            console.log(
                "Type:",
                file.type ||
                "Unknown"
            );
        }
    }
);


// ============================================================
// PAGE INITIALIZATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "========================================"
        );

        console.log(
            "   TrustGuard AI SECURITY SYSTEM"
        );

        console.log(
            "========================================"
        );

        console.log(
            "Frontend loaded successfully."
        );

        console.log(
            "API:",
            API_BASE_URL
        );

        updateDashboard();

        await checkBackendConnection();

        console.log(
            backendOnline
                ? "🟢 TrustGuard AI backend is ONLINE."
                : "🟠 Backend unavailable - local message detector available."
        );
    }
);


// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

window.addEventListener(
    "error",
    event => {

        console.error(
            "Frontend error:",
            event.error ||
            event.message
        );
    }
);


// ============================================================
// UNHANDLED PROMISE ERROR
// ============================================================

window.addEventListener(
    "unhandledrejection",
    event => {

        console.error(
            "Unhandled promise error:",
            event.reason
        );
    }
);


// ============================================================
// STARTUP
// ============================================================

console.log(
    "🛡️ TrustGuard AI JavaScript loaded."
);

console.log(
    "Message endpoint:",
    MESSAGE_ENDPOINT
);

console.log(
    "Voice endpoint:",
    VOICE_ENDPOINT
);
// ============================================================
// SIMULATED AI VOICE CALL PROTECTION
// ============================================================

function startVoiceCallProtection() {

    const callCard =
        document.getElementById("voiceCallProtection");

    if (!callCard) {

        createVoiceCallProtectionUI();
    }

    const card =
        document.getElementById("voiceCallProtection");

    if (!card) {
        return;
    }

    card.classList.remove("hidden");

    const status =
        document.getElementById("voiceCallStatus");

    if (status) {

        status.innerHTML =
            "🟢 <strong>CALL PROTECTION ACTIVE</strong><br>" +
            "🎙️ Monitoring voice communication...";
    }
}


// ============================================================
// CREATE VOICE CALL PROTECTION UI
// ============================================================

function createVoiceCallProtectionUI() {

    const container =
        document.querySelector(".container");

    if (!container) {
        return;
    }

    const card =
        document.createElement("div");

    card.id =
        "voiceCallProtection";

    card.className =
        "card voice-call-card";

    card.innerHTML = `

        <h2>
            📞 AI Voice Call Protection
        </h2>

        <p>
            TrustGuard AI can simulate real-time
            voice impersonation protection for incoming calls.
        </p>

        <div
            id="voiceCallStatus"
            class="voice-call-status"
        >
            🟢
            <strong>
                CALL PROTECTION READY
            </strong>

            <br>

            Select a voice recording and analyze it
            to simulate call protection.
        </div>

        <button
    onclick="startVoiceRecording()"
>
    🎙️ Start Caller Analysis
</button>

<button
    onclick="stopAndAnalyzeCallerVoice()"
>
    ⏹️ Stop & Analyze Caller
</button>

<button
    onclick="simulateIncomingVoiceCall()"
>
    📞 Simulate Using Selected Voice
</button>

        <div
            id="voiceCallResult"
            class="voice-call-result hidden"
        >
        </div>

    `;

    container.appendChild(card);
}


// ============================================================
// SIMULATE INCOMING CALL
// ============================================================

function simulateIncomingVoiceCall() {

    const fileInput =
        document.getElementById("voiceFile");

    const resultBox =
        document.getElementById("voiceCallResult");

    const status =
        document.getElementById("voiceCallStatus");


    if (!fileInput ||
        !fileInput.files ||
        fileInput.files.length === 0) {

        alert(
            "Please select a voice recording first."
        );

        return;
    }


    if (!lastVoiceResult) {

        alert(
            "Please analyze the voice recording first."
        );

        return;
    }


    const file =
        fileInput.files[0];

    const score =
        normalizeScore(
            lastVoiceResult.risk_score
        );

    const level = getRiskLevel(score);

    if (status) {

        status.innerHTML = `
            🟡
            <strong>
                INCOMING CALL DETECTED
            </strong>
            <br>
            🎙️ Analyzing caller voice...
        `;
    }


    if (!resultBox) {
        return;
    }


    resultBox.classList.remove(
        "hidden"
    );


    // ========================================================
    // HIGH RISK CALL
    // ========================================================

    if (level === "HIGH") {

        resultBox.innerHTML = `

            <div class="voice-call-danger">

                <h3>
                    🚨 POSSIBLE VOICE IMPERSONATION DETECTED
                </h3>

                <p>
                    <strong>
                        Caller Risk:
                    </strong>

                    ${score}/100
                </p>

                <p>
                    <strong>
                        Risk Level:
                    </strong>

                    🔴 HIGH
                </p>

                <p>
                    The analyzed voice contains
                    suspicious acoustic characteristics.
                </p>

                <div class="voice-call-actions">

                    <button
                        onclick="endProtectedVoiceCall()"
                    >
                        🛑 End / Block Call
                    </button>

                    <button
                        onclick="verifyVoiceCaller()"
                    >
                        🔐 Verify Caller
                    </button>

                </div>

                <p class="voice-call-warning">
                    ⚠️ Do not share OTPs, passwords,
                    banking details, PINs, or transfer money
                    until the caller is independently verified.
                </p>

            </div>
        `;
                // AUTOMATIC HIGH-RISK CALL BLOCKING
        setTimeout(() => {
            endProtectedVoiceCall();
        }, 1500);
    }


    // ========================================================
    // MEDIUM RISK CALL
    // ========================================================

    else if (level === "MEDIUM") {

        resultBox.innerHTML = `

            <div class="voice-call-warning-box">

                <h3>
                    ⚠️ SUSPICIOUS VOICE DETECTED
                </h3>

                <p>
                    <strong>
                        Caller Risk:
                    </strong>

                    ${score}/100
                </p>

                <p>
                    The caller voice has some
                    suspicious characteristics.
                </p>

                <div class="voice-call-actions">

                    <button
                        onclick="verifyVoiceCaller()"
                    >
                        🔐 Verify Caller
                    </button>

                    <button
                        onclick="continueProtectedCall()"
                    >
                        Continue Carefully
                    </button>

                </div>

            </div>
        `;
    }


    // ========================================================
    // LOW RISK CALL
    // ========================================================

    else {

        resultBox.innerHTML = `

            <div class="voice-call-safe">

                <h3>
                    🟢 LOW VOICE IMPERSONATION RISK
                </h3>

                <p>
                    Caller Risk:
                    <strong>
                        ${score}/100
                    </strong>
                </p>

                <p>
                    No strong suspicious acoustic
                    characteristics were detected.
                </p>

                <button
                    onclick="continueProtectedCall()"
                >
                    📞 Continue Call
                </button>

            </div>
        `;
    }
}


// ============================================================
// END / BLOCK CALL
// ============================================================

function endProtectedVoiceCall() {

    const status =
        document.getElementById(
            "voiceCallStatus"
        );

    const result =
        document.getElementById(
            "voiceCallResult"
        );


    if (status) {

        status.innerHTML = `
            🔴
            <strong>
                CALL BLOCKED
            </strong>
            <br>
            🛑 TrustGuard AI prevented
            the user from trusting the suspicious call.
        `;
    }


    if (result) {

        result.innerHTML = `

            <div class="voice-call-danger">

                <h3>
                    🛑 CALL ENDED / BLOCKED
                </h3>

                <p>
                    The suspicious voice communication
                    has been blocked in this simulation.
                </p>

                <p>
                    🔐 User protection action completed.
                </p>

            </div>
        `;
    }
}


// ============================================================
// VERIFY CALLER
// ============================================================

function verifyVoiceCaller() {

    const result =
        document.getElementById(
            "voiceCallResult"
        );

    if (!result) {
        return;
    }

    result.innerHTML += `

        <div class="voice-verification">

            <h3>
                🔐 Verify Caller
            </h3>

            <p>
                Do not rely only on the voice.
                Contact the person through another
                trusted channel, such as a saved phone
                number or an existing messaging contact.
            </p>

            <strong>
                Recommended:
            </strong>

            <ul>
                <li>Ask a personal verification question.</li>
                <li>Call the person back using a trusted number.</li>
                <li>Never share OTPs or financial credentials.</li>
            </ul>

        </div>
    `;
}


// ============================================================
// CONTINUE CALL
// ============================================================

function continueProtectedCall() {

    const status =
        document.getElementById(
            "voiceCallStatus"
        );

    if (status) {

        status.innerHTML = `
            🟢
            <strong>
                CALL CONTINUING WITH PROTECTION
            </strong>
            <br>
            TrustGuard AI remains alert for suspicious behavior.
        `;
    }
}


// ============================================================
// AUTO-CREATE PROTECTION CARD
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        createVoiceCallProtectionUI();

    }
);


// ============================================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// ============================================================

window.startVoiceCallProtection =
    startVoiceCallProtection;

window.simulateIncomingVoiceCall =
    simulateIncomingVoiceCall;

window.endProtectedVoiceCall =
    endProtectedVoiceCall;

window.verifyVoiceCaller =
    verifyVoiceCaller;

window.continueProtectedCall =
    continueProtectedCall;
// ============================================================
// VOICE RECORDING
// ============================================================

let mediaRecorder = null;
let recordedChunks = [];
let recordedVoiceFile = null;

async function startVoiceRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true
        });

        recordedChunks = [];

        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = function (event) {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = function () {
            const audioBlob = new Blob(recordedChunks, {
                type: "audio/webm"
            });

            recordedVoiceFile = new File(
                [audioBlob],
                "recorded_voice.webm",
                {
                    type: "audio/webm"
                }
            );

            const audioURL = URL.createObjectURL(audioBlob);

            const audioPlayer = document.getElementById("recordedAudio");
            audioPlayer.src = audioURL;
            audioPlayer.classList.remove("hidden");

            document.getElementById("recordingStatus").textContent =
                "✅ Recording ready. Click Analyze Voice.";

            document.getElementById("startRecordButton").disabled = false;
            document.getElementById("stopRecordButton").disabled = true;
        };

        mediaRecorder.start();

        document.getElementById("startRecordButton").disabled = true;
        document.getElementById("stopRecordButton").disabled = false;

        document.getElementById("recordingStatus").textContent =
            "🔴 Recording... Speak now.";

    } catch (error) {
        console.error("Microphone error:", error);

        document.getElementById("recordingStatus").textContent =
            "❌ Microphone permission denied or unavailable.";
    }
}


function stopVoiceRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();

        mediaRecorder.stream.getTracks().forEach(track => {
            track.stop();
        });
    }
}
// ============================================================
// ANALYZE RECORDED CALLER VOICE
// ============================================================

async function analyzeRecordedCallerVoice() {

    if (!recordedVoiceFile) {
        alert("Please record the caller's voice first.");
        return;
    }

    const status =
        document.getElementById("voiceCallStatus");

    const resultBox =
        document.getElementById("voiceCallResult");

    if (status) {
        status.innerHTML = `
            🟡 <strong>ANALYZING CALLER VOICE...</strong><br>
            🧠 TrustGuard AI is checking the voice for
            impersonation risk.
        `;
    }

    if (resultBox) {
        resultBox.classList.remove("hidden");

        resultBox.innerHTML = `
            <p>🧠 Analyzing caller voice...</p>
        `;
    }

    try {

        const formData = new FormData();

        formData.append(
            "file",
            recordedVoiceFile,
            recordedVoiceFile.name
        );

        const response = await fetch(
            VOICE_ENDPOINT,
            {
                method: "POST",
                body: formData
            }
        );

        const result = await response.json();

        console.log(
            "Caller voice analysis:",
            result
        );

        if (!response.ok ||
            result.status !== "success") {

            throw new Error(
                result.message ||
                "Voice analysis failed."
            );
        }

        // Store result for existing call-protection system
        lastVoiceResult = result;

        const score = normalizeScore(
            result.impersonation_risk_score
        );

        const level = getRiskLevel(score);

        // ====================================================
        // HIGH RISK
        // ====================================================

        if (level === "HIGH") {

            if (status) {
                status.innerHTML = `
                    🔴 <strong>
                    HIGH-RISK CALL DETECTED
                    </strong><br>
                    🚨 Possible voice impersonation detected.
                `;
            }

            if (resultBox) {

                resultBox.innerHTML = `
                    <div class="voice-call-danger">

                        <h3>
                            🚨 POSSIBLE VOICE IMPERSONATION
                        </h3>

                        <p>
                            <strong>Caller Risk:</strong>
                            ${score}/100
                        </p>

                        <p>
                            <strong>Risk Level:</strong>
                            🔴 HIGH
                        </p>

                        <p>
                            The caller's voice contains
                            suspicious acoustic characteristics.
                        </p>

                        <p>
                            ⚠️ Do not share OTPs, passwords,
                            PINs, banking details or money.
                        </p>

                        <button
                            onclick="endProtectedVoiceCall()"
                        >
                            🛑 End / Block Call
                        </button>

                        <button
                            onclick="verifyVoiceCaller()"
                        >
                            🔍 Verify Caller
                        </button>

                    </div>
                `;
            }

            // Automatically block high-risk calls
            setTimeout(() => {
                endProtectedVoiceCall();
            }, 3000);

        }

        // ====================================================
        // MEDIUM RISK
        // ====================================================

        else if (level === "MEDIUM") {

            if (status) {
                status.innerHTML = `
                    🟡 <strong>
                    SUSPICIOUS CALL DETECTED
                    </strong><br>
                    ⚠️ Verify the caller independently.
                `;
            }

            if (resultBox) {

                resultBox.innerHTML = `
                    <div class="voice-call-warning-box">

                        <h3>
                            ⚠️ SUSPICIOUS CALL
                        </h3>

                        <p>
                            <strong>Caller Risk:</strong>
                            ${score}/100
                        </p>

                        <p>
                            <strong>Risk Level:</strong>
                            🟡 MEDIUM
                        </p>

                        <p>
                            Some suspicious acoustic
                            characteristics were detected.
                        </p>

                        <button
                            onclick="verifyVoiceCaller()"
                        >
                            🔍 Verify Caller
                        </button>

                        <button
                            onclick="endProtectedVoiceCall()"
                        >
                            🛑 End Call
                        </button>

                    </div>
                `;
            }

        }

        // ====================================================
        // LOW RISK
        // ====================================================

        else {

            if (status) {
                status.innerHTML = `
                    🟢 <strong>
                    CALL APPEARS LOW RISK
                    </strong><br>
                    ✅ No strong suspicious acoustic
                    indicators detected.
                `;
            }

            if (resultBox) {

                resultBox.innerHTML = `
                    <div class="voice-call-safe">

                        <h3>
                            🟢 CALL APPEARS SAFE
                        </h3>

                        <p>
                            <strong>Caller Risk:</strong>
                            ${score}/100
                        </p>

                        <p>
                            <strong>Risk Level:</strong>
                            🟢 LOW
                        </p>

                        <button
                            onclick="continueProtectedCall()"
                        >
                            📞 Continue Call
                        </button>

                    </div>
                `;
            }
        }

    } catch (error) {

        console.error(
            "Caller voice analysis error:",
            error
        );

        if (status) {
            status.innerHTML = `
                🔴 <strong>
                CALL ANALYSIS FAILED
                </strong>
            `;
        }

        if (resultBox) {
            resultBox.innerHTML = `
                <p>
                    ❌ Unable to analyze caller voice.
                </p>

                <p>
                    ${error.message}
                </p>
            `;
        }
    }
}
// ============================================================
// STOP RECORDING AND ANALYZE CALLER VOICE
// ============================================================

function stopAndAnalyzeCallerVoice() {

    if (!mediaRecorder) {
        alert("No caller voice recording is active.");
        return;
    }

    if (mediaRecorder.state === "recording") {

        mediaRecorder.stop();

        mediaRecorder.stream
            .getTracks()
            .forEach(track => track.stop());

        // Wait for MediaRecorder.onstop to create recordedVoiceFile
        setTimeout(() => {
            analyzeRecordedCallerVoice();
        }, 300);

    } else {

        analyzeRecordedCallerVoice();

    }
}