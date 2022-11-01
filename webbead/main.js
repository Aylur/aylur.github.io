import * as Page from './page.js';
import * as UI from './ui.js';
import * as Utils from './utils.js';

const body = document.querySelector('body');

class SettingsDialog extends UI.Dialog{
    constructor(){
        let settings = document.createElement('div');
        super({
            text: 'Settings',
            widget: settings,
            buttons: []
        });

        this.settings = settings;
        this._addSlider( 'Roundness', 'round', 0, 10 );
        this._addSlider( 'Spacing', 'spacing', 0, 10 );
        this._addSlider( 'Board Spacing', 'board-spacing', 0, 6 );

        //so we can align it to left
        this.buttonField.appendChild(new UI.Button({
            text: 'Ok',
            callback: this.close.bind(this),
            x_align: 'end'
            }).node
        );
    }

    _addSetting(text, type){
        let row = document.createElement('div');
        row.style.display = 'grid';
        row.style.gridTemplateColumns = '1fr 1fr';

        let span = document.createElement('span');
        span.innerText = text;
        row.appendChild(span);

        let input = document.createElement('input');
        input.type = type;
        row.appendChild(input);

        this.settings.appendChild(row);
        return input;
    }

    _addSlider(text, name, min, max){
        let slider = this._addSetting(text, 'range');
        slider.value = Utils.getSetting(name);
        slider.min = min;
        slider.max = max;
        slider.addEventListener('input', () => {
            Utils.setSetting(name, slider.value);
            Utils.setProperty(name, `${slider.value/10}em`);
        });
    }
}

class HeaderBar{
    constructor(main){
        this.main = main;

        this.node = document.createElement('div');
        this.node.id = 'header-bar';
        this.node.style.display = 'grid';
        this.node.style.gridTemplateColumns = '1fr 1fr 1fr';

        this._backButton = new UI.Button({
            text: 'Back',
            callback: () => this.node.dispatchEvent(new Event('back')),
            x_align: 'start'
        });

        this._clock = new UI.Button({
            style_class: 'clock',
            x_align: 'center'
        });
        this.ellapsedTime = 0;

        this._playerName = new UI.Button({
            style_class: 'player-name',
            x_align: 'end'
        });

        this.node.appendChild(this._backButton.node);
        this.node.appendChild(this._clock.node);
        this.node.appendChild(this._playerName.node);

        this._clock.hide();
        this._playerName.hide();
    }

    hide(){ this.node.style.display = 'none' }
    show(){ this.node.style.display = 'grid' }

    resumeGame(){
        this._playerName.show();

        this._startClock();
        this._clock.show();
    }

    startGame(playerName, time = 0){
        this.ellapsedTime = time;
        this._playerName.text = playerName;
        this._playerName.show();

        this._startClock();
        this._clock.show();
    }

    stopGame(hide = true){
        if(hide){
            this._playerName.hide();
            this._clock.hide();
        }

        this._stopClock();
    }

    _refreshClock(){
        this._clock.text = Utils.msFormat(this.ellapsedTime);
    }

    _startClock(){
        this._refreshClock();
        this._timeout = setInterval(() => {
            ++this.ellapsedTime;
            this._refreshClock();
            this.node.dispatchEvent(new Event('tick'));
        }, 1000);
    }

    _stopClock(){
        clearInterval(this._timeout);
    }
}

class Main{
    constructor(){
        this.pages = {
            game: new Page.GamePage(),
            creator: new Page.CreatorPage(),
            records: new Page.RecordsPage(),
            main: new Page.MainPage()
        }

        this.headerBar = new HeaderBar(this);

        this.pageContainer = document.createElement('div');
        this.pageContainer.id = 'page-container';

        for (const page in this.pages) {
            if (Object.hasOwnProperty.call(this.pages, page)) {
                const pageObj = this.pages[page];
                this.pageContainer.appendChild(pageObj.node)
                pageObj.hide();
            }
        }
        this._showPage('main');

        body.appendChild(this.headerBar.node);
        body.appendChild(this.pageContainer);

        this.pages.main.node.addEventListener(
            'board-chosen', this._onBoardChosen.bind(this));

        this.pages.main.node.addEventListener(
            'show-records', this._onShowRecords.bind(this));

        this.pages.main.node.addEventListener(
            'show-creator', this._onShowCreator.bind(this));

        this.pages.main.node.addEventListener(
            'continue', this._onContinue.bind(this));

        this.pages.main.node.addEventListener(
            'settings', this._onSettings.bind(this));

        this.pages.main.node.addEventListener(
            'desciption', this._onDesciption.bind(this));

        this.pages.game.node.addEventListener(
            'game-end', this._onGameEnd.bind(this));

        this.pages.game.node.addEventListener(
            'board-changed', this._saveSession.bind(this));

        this.pages.game.node.addEventListener(
            'pause', this._onPause.bind(this));

        this.pages.game.node.addEventListener(
            'save-quit', this._onBack.bind(this));
            
        this.pages.creator.node.addEventListener(
            'save-board', this._onSaveBoard.bind(this));
            
        this.pages.creator.node.addEventListener(
            'delete-back', this._onBack.bind(this));

        this.headerBar.node.addEventListener(
            'back', this._onBack.bind(this));

        this.headerBar.node.addEventListener(
            'tick', this._saveSession.bind(this));

    }

    get playerName(){ return this.pages.main.playerName }

    _showPage(page){
        if(!this.pages[page]) return;

        if(this.shownPage)
            this.pages[this.shownPage].hide();

        this.pages[page].show();
        this.shownPage = page;

        page === 'main' ? 
            this.headerBar.hide() :
            this.headerBar.show();
    }

    _onBoardChosen(event){
        if(Utils.getSession() !== null){
            new UI.Dialog({
                text: 'Are you sure you want to start a new game?',
                sub_text: 'Your last game progression will be lost.',
                buttons: ['Yes', 'No']
            }).node.addEventListener('Yes', () => {
                this.pages.game.start(event.board);
                this.headerBar.startGame(this.pages.main.playerName);
                this._showPage('game');
            });
        }else{
            this.pages.game.start(event.board);
            this.headerBar.startGame(this.pages.main.playerName);
            this._showPage('game');
        }
    }

    _onGameEnd(){
        this.headerBar.stopGame();
        Utils.setSession(null);
        Utils.addRecord({
            board: this.pages.game.board,
            name: this.pages.main.playerName,
            time: this.headerBar.ellapsedTime
        });
        new UI.Dialog({
            text: `${this.pages.game.board.name} finished in
                ${Utils.msFormat(this.headerBar.ellapsedTime)}`,
            buttons: ['Ok']
        }).connect('Ok',
            () => this._showPage('main')
        );
    }

    _onPause(){
        this.headerBar.stopGame(false);
        new UI.Dialog({
            text: 'Game Paused',
            buttons: ['Resume']
        }).connect('Resume', () => {
            this.headerBar.resumeGame();
        });
    }

    _onShowCreator(){
        let playerBoards = Utils.getBoards().filter(b => !b.stock);
        if(playerBoards.length === 0){
            this.pages.creator.start();
            this._showPage('creator');
            return;
        }
        let dialog = new UI.Dialog({
            text: 'Do you want a new one or edit an existing board?',
            buttons: ['New', 'Edit', 'Back']
        });
        dialog.connect('New', () => {
            this.pages.creator.start();
            this._showPage('creator');
        });
        dialog.connect('Edit', () => {
            let chooser = new UI.BoardChooser(playerBoards);
            let dialog = new UI.Dialog({
                text: 'Choose which board to edit!',
                widget: chooser,
                buttons: ['Back']
            });
            chooser.addEventListener('board-chosen', (event) => {
                this.pages.creator.start(event.board);
                dialog.close();
                this._showPage('creator');
            });
        });
        dialog.connect('Back', () => { return });
    }

    _onSaveBoard(event){
        new UI.Dialog({
            text: 'Are you sure?',
            sub_text: "If the board's name is already taken, it will overwrite that board.",
            buttons: ['Save', 'Back'],
        }).connect('Save', () => {
            let board = event.board;
            Utils.removeBoard(board);
            Utils.addBoard(board);
            this._showPage('main');
        });
    }

    _onShowRecords(){
        if(Utils.getRecords().length === 0){
            new UI.Dialog({
                text: 'There are no records yet.',
                buttons: ['Ok']
            })
        }else{
            this._showPage('records');
        }
    }

    _onContinue(){
        let session = Utils.getSession();
        this.pages.game.start(session.board);
        this.headerBar.startGame(session.name, session.time);
        this._showPage('game');
    }

    _onSettings(){
        new SettingsDialog();
    }

    _onDesciption(){
        new UI.Dialog({
            style_class: 'description',
            text: 'Story',
            sub_text: 'Nekeresdországban Nevenincs királynak egyik szeme sír, a másik nevet. Nevet, mert végre elkészült a hatalmas kacsalábon forgó palotája, sok-sok tágas szobával és folyosóval. Ugyanakkor sír is, mert ezeket a helyiségeket be kell világítani és melegen kell tartani, azonban az aktuális rezsiemelkedés őt is érinti. Itt az ideje tehát elgondolkodni, hogy pontosan hová is helyezzünk el villanykörtéket, hogy minden megfelelően be legyen világítva; ugyanakkor csak oda helyezzünk el izzót, ahol ténylegesen szükség is van rá.',
            buttons: ['Next']
        }).connect('Next', () => {
            new UI.Dialog({
                style_class: 'description',
                text: 'Rules',
                sub_text: `
                <ul>
                    <li>A királynak négyzet alapú szobái vannak, amelyek fekete és fehér cellákból állnak.</li>
                    <li>A fehér cellákba villanykörtéket lehet elhelyezni.</li>
                    <li>A villanykörtékből a fény átlósan nem terjed, csak az adott sor és oszlop mentén.</li>
                    <li>A fekete cellákon valamilyen tereptárgy van, ami akadályozza a fény terjedését.</li>
                    <li>A fekete cellák opcionálisan egy egész számot is tartalmazhatnak 0-tól 4-ig. Ez azt jelzi, hogy hány szomszédos (alul, felül, jobbra, balra) cella tartalmaz villanykörtét. Ha van ilyen szám, akkor be kell tartani!</li>
                    <li>Két villanykörte soha nem világíthatja meg egymást!</li>
                    <li>A játék célja a villanykörtéket úgy elhelyezni, hogy minden fehér cellát megvilágítsanak.</li>
                    <li>A játékot egy játékos játssza, amíg meg nem oldja a rejtvényt, tehát több játékos egyidejű kezeléséről vagy körökre osztásról nem kell gondoskodni.</li>
                </ul>`,
                buttons: ['Ok']
            })
        });
    }

    _onBack(){
        if(this.shownPage === 'game'){
            this.headerBar.stopGame(false);
            let dialog = new UI.Dialog({
                text: 'Are you sure, you want to quit?',
                sub_text: 'Your progress will be saved.',
                buttons: ['No', 'Yes']
            });
            dialog.connect('No', () => {
                this.headerBar.resumeGame();
                this._saveSession();
            });
            dialog.connect('Yes', () => {
                this.headerBar.stopGame();
                this._showPage('main');
            });
        }

        if(this.shownPage === 'creator'){
            new UI.Dialog({
                text: 'Are you sure, you want to quit? Your board will be deleted.',
                sub_text: 'It will be deleted even if you selected a board to edit.',
                buttons: ['No', 'Yes']
            }).connect('Yes', () => {
                this._showPage('main');
            });
        }
        
        if(this.shownPage === 'records')
            this._showPage('main');
    }

    _saveSession(){
        Utils.setSession({
            board: this.pages.game.board,
            name: this.pages.main.playerName,
            time: this.headerBar.ellapsedTime
        });
    }
}

function showDescription(){
    new UI.Dialog({
        style_class: 'description',
        text: 'Story',
        sub_text: 'Nekeresdországban Nevenincs királynak egyik szeme sír, a másik nevet. Nevet, mert végre elkészült a hatalmas kacsalábon forgó palotája, sok-sok tágas szobával és folyosóval. Ugyanakkor sír is, mert ezeket a helyiségeket be kell világítani és melegen kell tartani, azonban az aktuális rezsiemelkedés őt is érinti. Itt az ideje tehát elgondolkodni, hogy pontosan hová is helyezzünk el villanykörtéket, hogy minden megfelelően be legyen világítva; ugyanakkor csak oda helyezzünk el izzót, ahol ténylegesen szükség is van rá.',
        buttons: ['Next']
    }).connect('Next', () => {
        new UI.Dialog({
            style_class: 'description',
            text: 'Rules',
            sub_text: `
            <ul>
                <li>A királynak négyzet alapú szobái vannak, amelyek fekete és fehér cellákból állnak.</li>
                <li>A fehér cellákba villanykörtéket lehet elhelyezni.</li>
                <li>A villanykörtékből a fény átlósan nem terjed, csak az adott sor és oszlop mentén.</li>
                <li>A fekete cellákon valamilyen tereptárgy van, ami akadályozza a fény terjedését.</li>
                <li>A fekete cellák opcionálisan egy egész számot is tartalmazhatnak 0-tól 4-ig. Ez azt jelzi, hogy hány szomszédos (alul, felül, jobbra, balra) cella tartalmaz villanykörtét. Ha van ilyen szám, akkor be kell tartani!</li>
                <li>Két villanykörte soha nem világíthatja meg egymást!</li>
                <li>A játék célja a villanykörtéket úgy elhelyezni, hogy minden fehér cellát megvilágítsanak.</li>
                <li>A játékot egy játékos játssza, amíg meg nem oldja a rejtvényt, tehát több játékos egyidejű kezeléséről vagy körökre osztásról nem kell gondoskodni.</li>
            </ul>`,
            buttons: ['Ok']
        })
    });
}

if(!localStorage.getItem('init')) showDescription();
Utils.init();
new Main();