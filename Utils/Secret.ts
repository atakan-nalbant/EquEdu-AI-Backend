

export function createSecret() {
    let timestamp = new Date().valueOf()
    let randomF = Math.random() * 100
    let secret = "BIN" + (timestamp + randomF).toString()
    return secret
}
