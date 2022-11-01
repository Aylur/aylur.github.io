import * as Board from './board.js';

const body = document.querySelector('body');

class Button{
    constructor(params){
        this.node = document.createElement('div');
        this.node.classList.add('button-bin');
        this.node.style.display = 'flex';
        this.node.style.flexGrow = '1'; 

        this.btn = document.createElement('button');
        this.btn.classList.add('button');
        this.btn.style.display = 'flex';

        this._text = document.createElement('span');
        this.btn.appendChild(this._text);

        if(params.style_class) this.btn.classList.add(params.style_class);
        if(params.text) this.text = params.text;
        if(params.callback) this.btn.addEventListener('click', params.callback);
        switch (params.x_align) {
            case 'start': this.node.style.justifyContent = 'flex-start';
                break;
            case 'center': this.node.style.justifyContent = 'center';
                break;
            case 'end': this.node.style.justifyContent = 'flex-end';
                break;
            default: this.btn.style.flexGrow = '1';
                break;
        }
        params.containerless ?
            this.node = this.btn :
            this.node.appendChild(this.btn);
    }

    set text(text){ this._text.innerHTML = text }

    hide(){ this.btn.style.display = 'none' }
    show(){ this.btn.style.display = 'flex' }
}

class Dialog{
    constructor(params = {}){

        this.node = document.createElement('div');
        this.node.classList.add('dialog');
        this.node.style.position = 'absolute';
        this.node.style.width = '100vw';
        this.node.style.height = '100vh';
        this.node.style.display = 'flex';

        let box = document.createElement('div');
        box.style.display = 'flex';
        box.style.flexDirection = 'column';
        box.style.margin = 'auto';

        let p = document.createElement('p');
        p.classList.add('text');
        if(params.text){
            p.innerHTML = params.text;
            box.appendChild(p);
        }

        if(params.sub_text){
            let span = document.createElement('span');
            span.classList.add('sub-text');
            span.innerHTML = params.sub_text;
            box.appendChild(span);
        }

        if(params.widget) box.appendChild(params.widget);

        if(params.buttons){
            this.buttonField = document.createElement('div');
            this.buttonField.style.display = 'flex';

            params.buttons.forEach(response => {
                this.buttonField.appendChild(new Button({
                    text: response,
                    callback: () => this._onRespone(response),
                    x_align: 'center'
                    }).node
                );
            });

            box.appendChild(this.buttonField);
        }

        if(params.style_class)
            this.node.classList.add(params.style_class);

        this.node.appendChild(box);
        body.appendChild(this.node);
    }

    connect(event, callback){
        this.node.addEventListener(event, callback, { once: true });
    }

    _onRespone(response){
        this.node.dispatchEvent(new Event(response));
        body.removeChild(this.node);
    }

    close(){ body.removeChild(this.node) }
}

class BoardChooser{
    constructor(boards){
        this.node = document.createElement('div');
        this.node.classList.add('board-chooser');

        this.boardContainer = document.createElement('div');
        this.boardContainer.classList.add('board-container');
        this.boardContainer.addEventListener('click', this._onBoardChosen.bind(this));

        this.previews = [];
        boards.forEach(b => {
            let preview = new Board.BoardPreview(b);
            preview.hide();
            this.boardContainer.appendChild(preview.node);
            this.previews.push(preview);
        });
        this.selectedBoard = 0;
        this.previews[this.selectedBoard].show();

        this.node.appendChild(new Button({
            style_class: 'left',
            text: '<',
            callback: () => this._cycleBoards('left'),
            }).node
        );
        this.node.appendChild(this.boardContainer);
        this.node.appendChild(new Button({
            style_class: 'right',
            text: '>',
            callback: () => this._cycleBoards('right'),
            }).node
        );

        return this.node;
    }
    
    _onBoardChosen(){
        let event = new Event('board-chosen');
        event.board = this.previews[this.selectedBoard].state;
        this.node.dispatchEvent(event);
    }

    _cycleBoards(direction){
        if(direction === 'left'){
            this.previews[ this.selectedBoard ].hide();
            if(this.previews[ this.selectedBoard-1 ]){
                this.previews[ this.selectedBoard-1 ].show();
                this.selectedBoard = this.selectedBoard-1;
            }else{
                this.previews[ this.previews.length-1 ].show();
                this.selectedBoard = this.previews.length-1;
            }
        }
        if(direction === 'right'){
            this.previews[ this.selectedBoard ].hide();
            if(this.previews[ this.selectedBoard+1 ]){
                this.previews[ this.selectedBoard+1 ].show();
                this.selectedBoard = this.selectedBoard+1;
            }else{
                this.previews[ 0 ].show();
                this.selectedBoard = 0;
            }
        }
    }
}

class SpinBox{
    constructor(params){

        if(params.value) this._value = params.value;
        if(params.min) this.min = params.min;
        if(params.max) this.max = params.max;
        params.text ? this.text = params.text : this.text = '';

        this.node = document.createElement('div');
        this.node.style.display = 'flex';
        this.node.style.justifyContent = 'space-around';
        this.node.style.alignItems = 'center';
        this.node.classList.add('spin-box');

        this.node.appendChild(new Button({
            text: '+',
            callback: this._increment.bind(this)
        }).node);

        this._text = document.createElement('span');
        this._text.innerText = this._value;
        this.node.appendChild(this._text);

        this.node.appendChild(new Button({
            text: '-',
            callback: this._decrement.bind(this)
        }).node);

        this.value = 0;
        this.min = 0,
        this.max = 100;
    }

    get value(){ return this._value }

    set value(value){
        if(value > this.max || value < this.min) return;
        this._value = value;
        this._text.innerText = this.text + this._value;
    }

    _decrement(){
        if(this._value-1 < this.min) return;

        --this.value;
        this.node.dispatchEvent(new Event('changed'));
    }

    _increment(){
        if(this._value+1 > this.max) return

        ++this.value;
        this.node.dispatchEvent(new Event('changed'));
    }
}

export { Button, BoardChooser, Dialog, SpinBox }