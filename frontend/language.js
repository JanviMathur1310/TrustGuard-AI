// ============================================================
// TRUSTGUARD AI - COMPLETE MULTILINGUAL SUPPORT
// ============================================================



// ============================================================
// APPLY TRANSLATION
// ============================================================

function applyLanguage(lang) {

    const t = translations[lang] || translations.en;

    // Save selected language
    localStorage.setItem("trustguardLanguage", lang);

    // --------------------------------------------------------
    // HEADER
    // --------------------------------------------------------

    const title = document.getElementById("appTitle");
    if (title) title.textContent = t.title;

    const subtitle = document.getElementById("appSubtitle");
    if (subtitle) subtitle.textContent = t.subtitle;

    // --------------------------------------------------------
    // LANGUAGE LABEL
    // --------------------------------------------------------

    const languageLabel =
        document.querySelector(".language-selector label");

    if (languageLabel) {
        languageLabel.textContent = "🌐 " + t.language + ":";
    }

    // --------------------------------------------------------
    // MESSAGE SECTION
    // --------------------------------------------------------

    const cards = document.querySelectorAll(".card");

    if (cards[0]) {

        const heading = cards[0].querySelector("h2");
        if (heading) heading.textContent = t.checkMessage;

        const textarea = document.getElementById("message");
        if (textarea) textarea.placeholder = t.messagePlaceholder;

        const buttons = cards[0].querySelectorAll("button");

        if (buttons[0]) {
            buttons[0].textContent = t.analyzeMessage;
        }

        if (buttons[1]) {
            buttons[1].textContent = t.liveProtection;
        }
    }

    // --------------------------------------------------------
    // VOICE SECTION
    // --------------------------------------------------------

    const voiceCard = document.querySelector(".voice-card");

    if (voiceCard) {

        const heading = voiceCard.querySelector("h2");
        if (heading) heading.textContent = t.voiceDetection;

        const paragraphs = voiceCard.querySelectorAll("p");

        if (paragraphs[0]) {
            paragraphs[0].textContent = t.voiceDescription;
        }

        const recorderHeading =
            voiceCard.querySelector(".voice-recorder h3");

        if (recorderHeading) {
            recorderHeading.textContent = t.recordVoice;
        }

        const recorderParagraph =
            voiceCard.querySelector(".voice-recorder p");

        if (recorderParagraph) {
            recorderParagraph.textContent = t.recordDescription;
        }

        const startButton =
            document.getElementById("startRecordButton");

        if (startButton) {
            startButton.textContent = t.startRecording;
        }

        const stopButton =
            document.getElementById("stopRecordButton");

        if (stopButton) {
            stopButton.textContent = t.stopRecording;
        }

        const recordingStatus =
            document.getElementById("recordingStatus");

        if (recordingStatus) {
            recordingStatus.textContent = t.readyRecording;
        }

        const voiceButtons =
            voiceCard.querySelectorAll("button");

        if (voiceButtons.length > 2) {
            voiceButtons[voiceButtons.length - 1].textContent =
                t.analyzeVoice;
        }
    }

    // --------------------------------------------------------
    // LIVE PROTECTION
    // --------------------------------------------------------

    const liveStatus = document.getElementById("liveStatus");

    if (liveStatus) {

        const strong = liveStatus.querySelector("strong");

        if (strong) {
            strong.textContent = t.liveActive;
        }

        const paragraph = liveStatus.querySelector("p");

        if (paragraph) {
            paragraph.textContent = t.liveDescription;
        }
    }

    // --------------------------------------------------------
    // DASHBOARD STATS
    // --------------------------------------------------------

    const statCards =
        document.querySelectorAll(".stat-card");

    if (statCards.length >= 4) {

        const labels = [
            t.messagesScanned,
            t.voiceScans,
            t.threatsDetected,
            t.currentRisk
        ];

        statCards.forEach((card, index) => {

            const heading = card.querySelector("h3");

            if (heading && labels[index]) {
                heading.textContent = labels[index];
            }

        });
    }

    // --------------------------------------------------------
    // INCOMING COMMUNICATION
    // --------------------------------------------------------

    const incomingCard =
        document.getElementById("incomingCard");

    if (incomingCard) {

        const heading =
            incomingCard.querySelector("h2");

        if (heading) {
            heading.textContent =
                t.incomingCommunication;
        }

        const sender =
            incomingCard.querySelector(".message-preview strong");

        if (sender) {
            sender.textContent = t.unknownSender;
        }

        const status =
            document.getElementById("analysisStatus");

        if (status) {
            status.textContent = t.waitingAnalysis;
        }
    }

    // --------------------------------------------------------
    // THREAT ALERT
    // --------------------------------------------------------

    const threatAlert =
        document.getElementById("threatAlert");

    if (threatAlert) {

        const heading =
            threatAlert.querySelector("h2");

        if (heading) {
            heading.textContent = t.threatDetected;
        }

        const buttons =
            threatAlert.querySelectorAll("button");

        if (buttons[0]) {
            buttons[0].textContent = t.viewDetails;
        }

        if (buttons[1]) {
            buttons[1].textContent = t.blockThreat;
        }

        if (buttons[2]) {
            buttons[2].textContent = t.dismiss;
        }
    }

    // --------------------------------------------------------
    // MESSAGE ANALYSIS RESULT
    // --------------------------------------------------------

    const result =
        document.getElementById("result");

    if (result) {

        const heading =
            result.querySelector("h2");

        if (heading) {
            heading.textContent = t.analysisResult;
        }

        const headings =
            result.querySelectorAll("h3");

        if (headings.length >= 2) {

            headings[0].textContent =
                t.detectedIndicators;

            headings[1].textContent =
                t.recommendation;
        }
    }

    // --------------------------------------------------------
    // VOICE ANALYSIS RESULT
    // --------------------------------------------------------

    translateVoiceResult(t);

    // --------------------------------------------------------
    // MESSAGE RESULT LABELS
    // --------------------------------------------------------

    translateResultLabels(t);
}


// ============================================================
// VOICE RESULT TRANSLATION
// ============================================================

function translateVoiceResult(t) {

    const result =
        document.getElementById("voiceResult");

    if (!result) return;

    const heading =
        result.querySelector("h3");

    if (heading) {
        heading.textContent = t.voiceAnalysis;
    }

    const labels =
        result.querySelectorAll("p strong");

    if (labels.length >= 7) {

        labels[0].textContent = t.status + ":";
        labels[1].textContent = t.duration + ":";
        labels[2].textContent = t.averageEnergy + ":";
        labels[3].textContent = t.zeroCrossing + ":";
        labels[4].textContent = t.spectralCentroid + ":";
        labels[5].textContent = t.riskScore + ":";
        labels[6].textContent = t.riskLevel + ":";
    }

    const riskHeading =
        document.querySelector("#voiceRisk h3");

    if (riskHeading) {
        riskHeading.textContent =
            t.impersonationRisk;
    }

    const indicatorsHeading =
        document.querySelector("#voiceIndicators h3");

    if (indicatorsHeading) {
        indicatorsHeading.textContent =
            t.voiceIndicators;
    }
}


// ============================================================
// RESULT LABEL TRANSLATION
// ============================================================

function translateResultLabels(t) {

    const result =
        document.getElementById("result");

    if (!result) return;

    const strongs =
        result.querySelectorAll("p strong");

    if (strongs.length >= 2) {

        strongs[0].textContent =
            t.riskScore + ":";

        strongs[1].textContent =
            t.riskLevel + ":";
    }
}


// ============================================================
// LANGUAGE SELECTOR
// ============================================================

function changeLanguage() {

    const selector =
        document.getElementById("languageSelect");

    if (!selector) return;

    const lang = selector.value;

    applyLanguage(lang);
}


// ============================================================
// LOAD SAVED LANGUAGE
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

    const selector =
        document.getElementById("languageSelect");

    const savedLanguage =
        localStorage.getItem("trustguardLanguage") || "en";

    if (selector) {
        selector.value = savedLanguage;
    }

    applyLanguage(savedLanguage);
});




// ============================================================
// DYNAMIC CONTENT TRANSLATION
// ============================================================

function updateDynamicLanguage() {

    const lang =
        localStorage.getItem("trustguardLanguage") || "en";

    const t = translations[lang] || translations.en;

    // Dashboard
    const statCards = document.querySelectorAll(".stat-card");

    if (statCards.length >= 4) {

        const labels = [
            t.messagesScanned,
            t.voiceScans,
            t.threatsDetected,
            t.currentRisk
        ];

        statCards.forEach((card, index) => {

            const heading = card.querySelector("h3");

            if (heading && labels[index]) {
                heading.textContent = labels[index];
            }

        });
    }


    // Incoming Communication
    const incoming =
        document.getElementById("incomingCard");

    if (incoming) {

        const heading =
            incoming.querySelector("h2");

        if (heading) {
            heading.textContent =
                t.incomingCommunication;
        }

        const sender =
            incoming.querySelector(
                ".message-preview strong"
            );

        if (sender) {
            sender.textContent =
                t.unknownSender;
        }
    }


    // Threat Alert
    const threat =
        document.getElementById("threatAlert");

    if (threat) {

        const heading =
            threat.querySelector("h2");

        if (heading) {
            heading.textContent =
                t.threatDetected;
        }

        const buttons =
            threat.querySelectorAll("button");

        if (buttons[0])
            buttons[0].textContent = t.viewDetails;

        if (buttons[1])
            buttons[1].textContent = t.blockThreat;

        if (buttons[2])
            buttons[2].textContent = t.dismiss;
    }


    // Message Result
    translateResultLabels(t);

    // Voice Result
    translateVoiceResult(t);
}


