const DEFAULTSIZE = 7;

class Cell{
    constructor(row, col, parent){
        this.col = col;
        this.row = row;
        this.parent = parent;

        this.node = document.createElement('button');
        this.node.classList.add('cell');
        this.node.style.alignSelf = 'stretch';
        this.node.style.justifySelf = 'stretch';

        this.node.obj = this;
    }

    get siblings(){
        let cells = this.parent.cells;
        let top, right, bottom, left;

        right = cells[this.row][this.col+1];
        left = cells[this.row][this.col-1];
    
        if(cells[this.row-1])
            top = cells[this.row-1][this.col];

        if(cells[this.row+1])
            bottom = cells[this.row+1][this.col];
        
        return {
            top: top,
            right: right,
            bottom: bottom,
            left: left,
            asArray: [top, right, bottom, left]};
    }

    get type(){
        switch (this.constructor) {
            case WhiteCell: return 'white';
            case BlackCell: return 'black';
            default: return 'none';
        }
    }

    set type(type){
        let newCell;
        if(type === 'white'){
            if(this.type === 'white') return;
            newCell = new WhiteCell(this.row, this.col, this.parent);
        }
        if(type === 'black'){
            if(this.type === 'black') return;
            newCell = new BlackCell(this.row, this.col, this.parent);
        }
        let oldCell = this.parent.cells[this.row][this.col];
        this.parent.node.replaceChild(newCell.node, oldCell.node);
        this.parent.cells[this.row][this.col] = newCell;
    }

    reset(){}
}

class WhiteCell extends Cell{
    constructor(row, col, parent){
        super(row, col, parent);

        this.node.classList.add('white');
    }

    get lit(){ return this.node.classList.contains('lit') }

    get conflicts(){ return this.node.classList.contains('conflicts') }

    get hasBulb(){ return this.node.classList.contains('with-bulb') }

    set hasBulb(b){
        b ? this.node.classList.add('with-bulb'):
            this.node.classList.remove('with-bulb');
    }

    set lit(b){
        b ? this.node.classList.add('lit') :
            this.node.classList.remove('lit');
    }

    set conflicts(b){
        b ? this.node.classList.add('conflicts') :
            this.node.classList.remove('conflicts');
    }

    get correct(){
        return (this.lit || this.hasBulb) && !this.conflicts;
    }

    reset(){
        this.lit = false;
        this.conflicts = false;
        this.hasBulb = false;
    }

    async _light(direction, animation){
        if(animation)
            await new Promise(r => setTimeout(r, 100));

        this.lit = true;
        if(this.siblings[direction]){
            await this.siblings[direction]._light(direction, animation);
        }
    }

    async ray(animation = false){
        if(!this.hasBulb) return;

        this.raying = true;
        this.lit = true;
        const [top, right, bottom, left] = this.siblings.asArray;
        await Promise.all([
            ( async() => { if(top) return top._light('top', animation) })(),
            ( async() => { if(bottom) return bottom._light('bottom', animation) })(),
            ( async() => { if(right) return right._light('right', animation) })(),
            ( async() => { if(left) return left._light('left', animation) })(),
        ]);
        this.node.dispatchEvent(new Event('ray-finished'));
        this.raying = false;
    }

    _litFrom(direction){
        if(this.hasBulb) return true;

        if(this.siblings[direction]){
            return this.siblings[direction]._litFrom(direction);
        }
    }

    check(){
        if(!this._shouldBeLit())
            this.lit = false;

        if(this.hasBulb){
            let conflicts = false;
            const [top, right, bottom, left] = this.siblings.asArray;
            if(top && top._litFrom('top')) conflicts = true;
            if(bottom && bottom._litFrom('bottom')) conflicts = true;
            if(left && left._litFrom('left')) conflicts = true;
            if(right && right._litFrom('right')) conflicts = true;
            this.conflicts = conflicts;
        }

        if(!this.hasBulb && this.conflicts)
            this.conflicts = false;
    }

    _shouldBeLit(){
        if(this.hasBulb) return true;

        const [top, right, bottom, left] = this.siblings.asArray;
        if(top && top._litFrom('top')) return true;
        if(bottom && bottom._litFrom('bottom')) return true;
        if(left && left._litFrom('left')) return true;
        if(right && right._litFrom('right')) return true;

        return false;
    }
}

class BlackCell extends Cell{
    constructor(row, col, parent, number){
        super(row, col, parent);

        this.number = number;
        
        this.node.classList.add('black');
        this.check();
    }

    get correct(){
        if(!this.numbered) return true;
        return this.node.classList.contains('correct');
    }

    get numbered(){ return this.number !== -1 }

    get number(){ return this.barrier }

    set number(num){
        if(num > 4 || num < 0 || typeof num === 'undefined')
            this.barrier = -1;
        else this.barrier = num;

        if(this.numbered){
            this.node.classList.add('numbered');
            this.node.innerText = this.number;
        }else{
            this.node.classList.remove('numbered');
            this.node.innerText = '';
        }
    }

    set correct(b){
        b ? this.node.classList.add('correct') :
            this.node.classList.remove('correct');
    }

    check(){
        if(!this.numbered)
            return this.correct = true;

        let count = 0;
        this.siblings.asArray.forEach(s => {
            if(s && s.hasBulb) ++count;
        });

        this.correct = count === this.number;
    }

    _light(){}
    _litFrom(){}
}

class Board{
    constructor(state){
        this.node = document.createElement('button');
        this.node.classList.add('board');

        this.state = state;
        
        this.node.addEventListener('click', this._onClick.bind(this));
        this.show();
    }

    get state(){
        this._refreshState();
        return this._state;
    }

    set state(state){
        if(state){
            this._state = state;
            this.size = state.size;
        }else{
            this._state = {};
            this.size = { rows: DEFAULTSIZE, cols: DEFAULTSIZE};
        }
    }

    set size(size){
        let cols, rows;
        if(!size || !size.rows || !size.cols){
            rows = DEFAULTSIZE;
            cols = DEFAULTSIZE;
        }else{
            rows = size.rows;
            cols = size.cols;
        }
        this.node.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        this.node.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        this._state.size = { rows: rows, cols: cols };

        this._rebuild();
    }

    get size(){
        return this._state.size;
    }

    set name(name){
        this._state.name = name;
    }

    get name(){
        if(this._state.name)
            return this._state.name;
        
        this._state.name = "Nameless Board";
        return "Nameless Board";
    }

    get finished(){
        for (const row of this.cells) {
            for (const cell of row) {
                if(!cell.correct)
                    return false;
            }
        }
        return true;
    }

    show(){ this.node.style.display = 'grid'; }
    hide(){ this.node.style.display = 'none'; }

    reset(){
        this.cells.forEach(row => 
            row.forEach(cell => {
                cell.reset();
            })
        );
        this._state.bulbedCells = [];
    }

    _refreshState(){
        this._state.bulbedCells = [];
        this.cells.forEach(row => 
            row.forEach(cell => {
                if(cell.hasBulb){
                    this._state.bulbedCells.push(
                        {
                            row: cell.row,
                            col: cell.col
                        }
                    )
                }
            })
        );
    }

    _onClick(event){
        const cell = event.target.obj;
        if(!cell) return;
        if(cell.type === 'black')
            return;

        if(cell.hasBulb){
            if(!cell.raying)
                cell.hasBulb = false;
        }else{
            cell.hasBulb = true;
            cell.ray(true);
        }

        this.cells.forEach(row => {
            row.forEach(cell => {
                cell.check();
            });
        });
        this._refreshState();

        cell.node.addEventListener('ray-finished', () => {    
            if(this.finished && !this.finishDispatched){
                this.node.dispatchEvent(new Event('game-end'));
                //ez arra kell ha kettő cella még animáció alatt
                //lehetséges hogy mindkettő után dispatchel
                this.finishDispatched = true;
            }
        }, { once: true });
    }

    _rebuild(){
        if(this.cells)
            this.cells.forEach(row => {
                row.forEach(cell => {
                    this.node.removeChild(cell.node)
                });
            });
        
        this.cells = [];
        for (let row=0; row<this.size.rows; row++) {
            this.cells[row] = [];
            for (let col=0; col<this.size.cols; col++) {
                let cell = new WhiteCell(row, col, this);
                this.cells[row][col] = cell;
                this.node.appendChild(cell.node);
            }
        }

        this._loadState();
    }

    _loadState(){
        if(this._state.bulbedCells){
            this._state.bulbedCells.forEach(cell => {
                if(this.cells[cell.row] &&
                    this.cells[cell.row][cell.col])
                        this.cells[cell.row][cell.col].hasBulb = true
            });
        }

        if(this._state.blackCells){
            this._state.blackCells.forEach(cell => {
                if(this.cells[cell.row] &&
                    this.cells[cell.row][cell.col]){
                        this.cells[cell.row][cell.col].type = 'black';
                        this.cells[cell.row][cell.col].number = cell.number;
                        this.cells[cell.row][cell.col].check();
                }
            });
        }

        this.cells.forEach(row => {
            row.forEach(cell => {
                if(cell.type === 'white')
                    cell.ray();
            });
        });
    }
}

class BoardPreview extends Board{
    constructor(state){
        super(state);

        this.reset();
        this.node = this.node.cloneNode();
        this.node.classList.add('preview');

        this.cells.forEach(row => 
            row.forEach(cell => {
                let node = cell.node.cloneNode();
                node.tabIndex = -1;
                if(cell.numbered)
                    node.innerText = cell.number
                    
                this.node.appendChild(node);
            })
        );
    }
}

class BoardBuilder extends Board{
    constructor(state){
        super(state);

        this.reset();
        this.node.classList.add('builder');
    }

    _onClick(event){
        const cell = event.target.obj;
        if(!cell) return;

        if(cell.type === 'black'){
            if(cell.number  === 4){
                cell.type = 'white';
            }else
                cell.number += 1;
        }
        if(cell.type === 'white'){
            cell.type = 'black';
        }
        this._refreshState();
    }

    _refreshState(){
        this._state.bulbedCells = [];
        this._state.blackCells = [];
        this.cells.forEach(row => 
            row.forEach(cell => {
                if(cell.type === 'black'){
                    this._state.blackCells.push(
                        {
                            row: cell.row,
                            col: cell.col,
                            number: cell.number
                        }
                    )
                }
            })
        );
    }
}

export { Board, BoardBuilder, BoardPreview }