class Kernel {
    constructor(webR, options) {
        this.webR = webR;
        this.shelter = new webR.Shelter();
        this.options = Object.assign({
            captureConditions: true,
            captureStreams: true,
            withAutoprint: true
        }, options)
    }

    run(code) {
        return this.shelter.then(shelter => {
            // console.log("Executing:", code);
            return shelter.captureR(code, this.options);
        })
    }

    interrupt() {
        this.webR.interrupt();
    }
}

export {
    Kernel
}
