class Animation {
    constructor() {
        this.mainText = 'Я научу тебя какать'
        this.textSliceWidth = 30
        this.waveLength = 200
        this.waveAmplitude = 15
        this.waveSpeed = 1
        this.textSpeed = -2
        this.c = new Canvas()
        this.loadImage('image.jpeg')
    }

    init() {
        this.createTextData()
        this.setupProperties()
        // this.createColorSet()
        // this.replaceTextColor()
        window.addEventListener('resize', () => {
            this.c.fitToScreen()
            this.createTextData()
            this.setupProperties()
        })

        this.animate()
    }

    setupProperties() {
        // this.gradientLayer = this.c.createGradient()
        this.textSliceCount = this.textArea.w / this.textSliceWidth
        this.twoPI = Math.PI * 2
        this.textY = (this.c.h - this.textArea.h) / 2
        this.textX = 0
    }

    createTextData() {
        this.textArea = this.c.drawText(this.mainText)
        this.textData = this.c.gid(this.textArea)
        this.c.clear()
    }

    loadImage(url) {
        this.imgLayer = new Image()
        this.imgLayer.src = url
        this.imgLayer.onload = () => this.init()
    }

    // createColorSet() {
    //     for(let i = 0; i < this.textArea.w; i++) {
    //         const currentColor = `hsl(${i / this.textArea.w * 360}, 100%, 50%)`
    //         this.c.rect(currentColor, i, 300, 1, 30)
    //     }
    //     this.colorSetData = this.c.gid({x: 0, y: 300, w: this.textArea.w, h: 1})
    // }

    // replaceTextColor() {
    //     const colorSetPixelData = this.colorSetData.data
    //     const textPixelData = this.textData.data

    //     for(let x = 0; x < this.textData.width; x++) {
    //         for(let y = 0; y < this.textData.height; y++) {
    //             const red = (x + y * this.textData.width) * 4
    //             const green = red + 1
    //             const blue = red + 2
    //             const alpha = red + 3

    //             if(textPixelData[alpha] > 0) {
    //                 textPixelData[red] = colorSetPixelData[x * 4]
    //                 textPixelData[green] = colorSetPixelData[x * 4 + 1]
    //                 textPixelData[blue] = colorSetPixelData[x * 4 + 2]
    //             }
    //         }
    //     }
    // }

    wave() {
        const waveOffset = new Date().getMilliseconds() / 1000 * this.twoPI * this.waveSpeed
        for(let i = 0; i < this.textSliceCount; i++) {
            const xSlicePoint = i * this.textSliceWidth
            const offsetY = Math.sin(waveOffset + xSlicePoint / this.waveLength * this.twoPI) * this.waveAmplitude
            const y = this.textY + offsetY

            let x = this.textX
            if(x + xSlicePoint > this.c.w) {
                x = x - this.c.w
            }
            if(x + xSlicePoint < 0) {
                x = x + this.c.w
            }

            this.c.pid(this.textData, x, y, xSlicePoint, 0, this.textSliceWidth, this.textArea.h)
        }
        this.textX = (this.textX + this.textSpeed) % this.c.w 
    }

    addImageLayer() {
        this.c.gco('source-atop')
        this.c.ctx.drawImage(this.imgLayer, -200, -60)
    }

    animate() {
        this.c.clear()
        this.wave()
        this.addImageLayer()
        requestAnimationFrame(() => this.animate())
    }
}

class Canvas {
    constructor() {
        this.createCanvas()
        this.fitToScreen()
    }

    createCanvas() {
        this.cnv = document.createElement('canvas')
        this.ctx = this.cnv.getContext('2d')
        document.body.appendChild(this.cnv)
    }

    fitToScreen() {
        this.w = this.cnv.width = innerWidth
        this.h = this.cnv.height = innerHeight 
    }

    fitTextToCanvas(textWidth, textHeight) {
        return this.w / textWidth * textHeight
    }

    drawText(t = 'half-life') {
        this.ctx.font = `${this.h}px Arial Black`

        const newTextSize = this.fitTextToCanvas(this.ctx.measureText(t).width, this.h)
        this.ctx.font = `${newTextSize - 15}px Arial Black`
        this.ctx.fillStyle = 'white'
        this.ctx.textBaseline = 'top'
        this.ctx.fillText(t, 0, 0)

        const fw = this.ctx.measureText(t).width
        return { x: 0, y: 0, w: fw, h: newTextSize}
    }

    createGradient() {
        const gradient = this.ctx.createLinearGradient(0, 0, this.w, this.h)
        for(let i = 0; i < 360; i++) {
            const p = i / 360
            gradient.addColorStop(p, `hsl(${i}, 100%, 50%)`)
        }

        this.rect(gradient, 0, 0, this.w, this.h)
        const img = new Image()
        img.src = this.cnv.toDataURL()
        return img
    }

    gid({ x, y, w, h }) {
        return this.ctx.getImageData(x, y, w, h)
    }

    pid(d, x, y, dx, dy, dw, dh) {
        this.ctx.putImageData(d, x, y, dx, dy, dw, dh)
    }

    gco(type) {
        this.ctx.globalCompositeOperation = type
    }

    rect(c, x, y, w, h) {
        this.ctx.fillStyle = c
        this.ctx.fillRect(x, y, w, h)
    }

    clear() {
        this.ctx.clearRect(0, 0, this.w, this.h)
    }
}

window.onload = () => {
    new Animation()
}