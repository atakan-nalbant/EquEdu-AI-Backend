import fs from "fs"
import fetch from "node-fetch"

const subscriptionKey = "<subscriptionKey>";
const region = "westeurope";

export function prepareAzureTTSFile(text: string, fileName: string, language: string): Promise<Boolean> {
    return new Promise((res, rej) => {
        let url = "https://" + region + ".tts.speech.microsoft.com/cognitiveservices/v1"
        let lang = language === "en" ? "en-US" : "tr-TR"
        let voice = language === "en" ? "en-US-JennyNeural" : "tr-TR-EmelNeural"
        let body = "<speak version='1.0' xml:lang='" + lang + "'><voice xml:lang='" + lang + "' xml:gender='Female' name='" + voice + "'>" + text + "</voice></speak>"

        let headers = {
            "Content-Type": "application/ssml+xml",
            "Ocp-Apim-Subscription-Key": subscriptionKey,
            "X-Microsoft-Outputformat": "audio-48khz-192kbitrate-mono-mp3"
        }

        fetch(url, { headers: headers, body: body, method: "POST" }).then(resp => {
            console.log("fetched result")
            let f = fs.createWriteStream(fileName)
            let a = resp.body?.pipe(f)
            if (a !== undefined) {
                res(true)
            } else {
                rej(false)
            }
        }).catch(() => rej(false))
    })
}
