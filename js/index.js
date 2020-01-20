const rgbToHex = (value) => {
    let rgb = value.split('(')[1].split(')')[0];
    rgb = rgb.split(',');
    return `#${rgb.map((x) => {
        const hex = Number(x).toString(16);
        return hex.length === 1 ? `0${hex}` : hex;
    }).join('')}`;
};

const getCurrentColor = () => document.getElementById('change-color').value;

const setPreviousColor = (color) => {
    const previousColor = document.getElementById('previous');
    previousColor.style.backgroundColor = color;

    previousColor.onclick = () => {
        setCurrentColor(previousColor.style.backgroundColor);
    };
};

const setCurrentColor = (color = null) => {
    const currentColor = document.getElementById('current');
    const inputColor = document.getElementById('change-color');

    if (color == null) {
        inputColor.onchange = () => {
            setPreviousColor(window.getComputedStyle(currentColor).backgroundColor);
            currentColor.style.backgroundColor = inputColor.value;
        };
    } else {
        setPreviousColor(currentColor.style.backgroundColor);
        inputColor.value = rgbToHex(color);
        currentColor.style.backgroundColor = inputColor.value;
    }
};

const selectTool = (tool, size = 4) => {
    let isBucket = false;
    let isPencil = true;
    let isColorPicker = false;
    const setEventBucket = () => {
        if (!isBucket) return;
        const canvas = document.getElementById('main__canvas');
        canvas.style.cursor = 'url(./Codejam-Image-API/icons/Paint-bucket.svg) 2 2, pointer';
        canvas.onmousedown = () => {
            const drawArea = canvas.getContext('2d');
            drawArea.fillStyle = getCurrentColor();
            drawArea.fillRect(0, 0, canvas.width, canvas.height);
            canvas.style.cursor = 'default';
            isBucket = false;
        };
    };

    const setEventPencil = () => {
        if (!isPencil) return;
        const canvas = document.getElementById('main__canvas');
        canvas.style.cursor = 'url(./Codejam-Image-API/icons/pencil.svg) 2 2, pointer';
        const drawArea = canvas.getContext('2d');
        let isDrawing = false;
        const draw = (e) => {
            if (!isDrawing) return;
            drawArea.fillStyle = getCurrentColor();
            drawArea.fillRect(Math.floor(e.offsetX / (512 / size)) * (512 / size),
                Math.floor(e.offsetY / (512 / size)) * (512 / size), (512 / size), (512 / size));
        };

        canvas.onmousedown = (e) => {
            isDrawing = true;
            draw(e);
            canvas.onmousemove = (eMove) => {
                draw(eMove);
            };
        };
        canvas.onmouseup = () => {
            isPencil = false;
            isDrawing = false;
            isColorPicker = false;
        };
    };

    const setEventColor = () => {
        if (!isColorPicker) return;
        const canvas = document.getElementById('main__canvas');
        const area = canvas.getContext('2d');
        canvas.style.cursor = 'url(./Codejam-Image-API/icons/Color-picker.svg) 2 2, pointer';
        const setColor = (eColor) => {
            const color = area.getImageData(eColor.offsetX, eColor.offsetY, 1, 1).data;
            const colorRGB = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
            setCurrentColor(colorRGB);
        };
        canvas.onmousedown = (e) => setColor(e);
        canvas.onmouseup = () => {
            isColorPicker = false;
            canvas.style.cursor = 'default';
        };
    };

    switch (tool.id) {
        case 'bucket':
            isBucket = true;
            isPencil = false;
            isColorPicker = false;
            setEventBucket();
            break;
        case 'pencil':
            isBucket = false;
            isPencil = true;
            isColorPicker = false;
            setEventPencil(size);
            break;
        case 'color-picker':
            isBucket = false;
            isPencil = false;
            isColorPicker = true;
            setEventColor();
            break;
        default:
            break;
    }
    setEventPencil();
};

let initCounter = 0;

const initCanvas = (size) => {
    const radios = document.forms.form.elements.size;
    for (let i = 0; i < radios.length; i += 1) {
        radios[i].onchange = function () {
            initCanvas(this.value);
            selectTool('pencil', this.value);
        };
    }
    const drawImage = (url) => {
        const canvas = document.getElementById('main__canvas');
        const drawArea = canvas.getContext('2d');

        const baseImage = new Image();
        baseImage.src = url;
        baseImage.onload = function () {
            drawArea.clearRect(0, 0, canvas.width, canvas.height);
            drawArea.drawImage(baseImage, 0, 0);
        };
    };

    function getLinkToImage(city) {
        const url = `https://api.unsplash.com/photos/random?query=town,${city}&client_id=dd35ccb577f7a4c040a24ecc3709702b42092274a026d730be774e16ff38e6e7`;
        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                drawImage(data.urls.small);
            });
    }

    const input = document.getElementById('city');
    const findBtn = document.getElementById('find');
    document.forms.form.onsubmit = (e) => e.preventDefault();

    input.onkeypress = (event) => ((event.keyCode > 64 && event.keyCode < 91)
        || (event.keyCode > 96 && event.keyCode < 123) || event.keyCode === 8);

    input.onkeydown = (e) => {
        if (e.keyCode === 13) {
            getLinkToImage(input.value);
        }
    };

    findBtn.onclick = () => getLinkToImage(input.value);

    const tools = document.querySelectorAll('.tool');
    setCurrentColor();
    for (let i = 0; i < tools.length; i += 1) {
        tools[i].onclick = (e) => {
            selectTool(e.target, size);
        };
    }

    const red = document.getElementById('red');
    const blue = document.getElementById('blue');

    red.onmousedown = () => setCurrentColor('rgb(247, 65, 65)');
    blue.onmousedown = () => setCurrentColor('rgb(65, 182, 247)');

    if (!initCounter) {
        document.getElementById('start').click();
        initCounter += 1;
    }
};

window.addEventListener('load', initCanvas);
