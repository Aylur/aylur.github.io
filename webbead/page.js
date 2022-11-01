import * as Board from './board.js';
import * as UI from './ui.js';
import * as Utils from './utils.js';

class Page{
    constructor(){

        this.node = document.createElement('div');
        this.node.classList.add('page');
        this.node.style.flexDirection = 'column';

        this.buttonField = document.createElement('div');
        this.buttonField.style.display = 'flex';

        this.node.obj = this;
        this.hide();
    }

    show(){ this.node.style.display = 'flex'; }
    hide(){ this.node.style.display = 'none'; }
}

class MainPage extends Page{
    constructor(){
        super();

        //nameField
        this.nameField = document.createElement('div');
        this.nameField.style.display = 'flex';

        this.nameInput = document.createElement('input');
        this.nameInput.classList.add('name-input');
        this.nameInput.placeholder = 'Name: ';

        this.nameField.appendChild(this.nameInput);
        this.nameField.appendChild(new UI.Button({
            style_class: 'desciption',
            text: '📃',
            callback: () => this.node.dispatchEvent(new Event('desciption')),
            x_align: 'end'
            }).node
        )
        this.node.appendChild(this.nameField);
        this.nameField.appendChild(new UI.Button({
            style_class: 'settings',
            text: '⚙',
            callback: () => this.node.dispatchEvent(new Event('settings')),
            x_align: 'end'
            }).node
        )
        this.node.appendChild(this.nameField);

        //buttons
        this.buttonField.appendChild(new UI.Button({
            text: 'Records',
            callback: () => this.node.dispatchEvent(new Event('show-records')),
            containerless: true
            }).node
        );
        this.buttonField.appendChild(new UI.Button({
            text: 'Creator',
            callback: () => this.node.dispatchEvent(new Event('show-creator')),
            containerless: true
            }).node
        );
        this.node.appendChild(this.buttonField);

        this.continueButton = new UI.Button({
            text: 'Continue',
            callback: () => this.node.dispatchEvent(new Event('continue')),
            containerless: true
        });
        this.buttonField.appendChild(this.continueButton.node);

        //boardChooser
        this.boardChooser = document.createElement('div');
        this.node.appendChild(this.boardChooser);
    }

    get playerName(){
        if(this.nameInput.value === '')
            return 'Anonymus';
        
        return this.nameInput.value;
    }

    show(){
        super.show();
        Utils.getSession() ?
            this.continueButton.show() :
            this.continueButton.hide();
        
        this.boardChooser.innerHTML = '';
        let chooser = new UI.BoardChooser(Utils.getBoards());
        chooser.addEventListener('board-chosen', (event) => {
            let newEvent = new Event('board-chosen');
            newEvent.board = event.board;
            this.node.dispatchEvent(newEvent);
        });
        this.boardChooser.appendChild(chooser);
    }
}

class GamePage extends Page{
    constructor(){
        super();

        this.boardName = document.createElement('p');
        this.boardName.classList.add('board-name');
        this.node.appendChild(this.boardName);

        this.boardContainer = document.createElement('div');
        this.boardContainer.classList.add('board-container');
        this.node.appendChild(this.boardContainer);

        this.buttonField.appendChild(new UI.Button({
            text: 'Pause',
            callback: () => this.node.dispatchEvent(new Event('pause')),
            containerless: true
            }).node
        );
        this.buttonField.appendChild(new UI.Button({
            text: 'Save & Quit',
            callback: () => this.node.dispatchEvent(new Event('save-quit')),
            containerless: true
            }).node
        );
        this.node.appendChild(this.buttonField);

    }

    get board(){
        return this._board.state;
    }

    start(boardState){
        this._board = new Board.Board(boardState);
        this._board.node.addEventListener(
            'click',
            () => this.node.dispatchEvent(new Event('board-changed'))
        )
        this._board.node.addEventListener(
            'game-end',
            () => this.node.dispatchEvent(new Event('game-end')));

        this.boardName.innerText = boardState.name;
        this.boardContainer.innerHTML = '';
        this.boardContainer.appendChild(this._board.node);
    }
}

class RecordsPage extends Page{
    constructor(){
        super();

        this.node.classList.add('records');
        this.list = document.createElement('tbody');

        let table = document.createElement('table');

        table.innerHTML = `
        <thead><tr>
            <th>Player</th>
            <th>Board</th>
            <th>Time</th>
        </tr></thead>`;
        table.appendChild(this.list);

        this.node.appendChild(table);
    }

    _addRecords(record){
        let tr = `
        <tr>
            <td>${record.name}</td>
            <td>${record.board.name}</td>
            <td>${Utils.msFormat(record.time)}</td>
        </tr>`
        this.list.innerHTML += tr;
    }

    show(){
        super.show();
        this.list.innerHTML = '';

        if(Utils.getRecords())
        Utils.getRecords().forEach(record => {
            this._addRecords(record);
        });
    }
}

class CreatorPage extends Page{
    constructor(){
        super();

        this.nameField = document.createElement('input');
        this.nameField.classList.add('name-input');
        this.nameField.placeholder = "Board's Name: ";
        this.node.appendChild(this.nameField);

        this.spinBoxes = document.createElement('div');
        this.spinBoxes.style.display = 'grid';
        this.spinBoxes.style.gridTemplateColumns = '1fr 1fr';
        this.rowSpin = new UI.SpinBox({ text: 'Rows:', min: 1, max: 12, value: 7 });
        this.colSpin = new UI.SpinBox({ text: 'Cols:', min: 1, max: 12, value: 7 });
        this.spinBoxes.appendChild(this.rowSpin.node);
        this.spinBoxes.appendChild(this.colSpin.node);
        this.rowSpin.node.addEventListener('changed', this._resize.bind(this));
        this.colSpin.node.addEventListener('changed', this._resize.bind(this));
        this.node.appendChild(this.spinBoxes);

        this.boardContainer = document.createElement('div');
        this.node.appendChild(this.boardContainer);

        this.node.appendChild(this.buttonField);
        this.buttonField.appendChild(new UI.Button({
            text: 'Save',
            callback: this._onSave.bind(this),
            containerless: true
            }).node
        );
        this.buttonField.appendChild(new UI.Button({
            text: 'Delete & Back',
            callback: () => this.node.dispatchEvent(new Event('delete-back')),
            containerless: true
            }).node
        );
    }


    get board(){
        this._board.name = this.nameField.value;
        return this._board.state;
    }

    start(board){
        this.boardContainer.innerHTML = '';
        this.nameField.value = 'New Board';

        if(board){
            Utils.removeBoard(board);
            this.nameField.value = board.name;
            this._board = new Board.BoardBuilder(board);
            this.boardContainer.appendChild(this._board.node);
            this.rowSpin.value = board.size.rows;
            this.colSpin.value = board.size.cols;
        }
        else{
            this._board = new Board.BoardBuilder();
            this.boardContainer.appendChild(this._board.node);
            this.rowSpin.value = this._board.size.rows;
            this.colSpin.value = this._board.size.cols;
        }
    }

    _resize(){
        this._board.size = {
            rows: this.rowSpin.value,
            cols: this.colSpin.value,
        }
    }

    _onSave(){
        let event = new Event('save-board');
        event.board = this.board;
        this.node.dispatchEvent(event);
    }
}

export { MainPage, GamePage, CreatorPage, RecordsPage }