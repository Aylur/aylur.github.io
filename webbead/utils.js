const setProperty = (property, value) => {
    document.querySelector(':root').style
        .setProperty(`--${property}`, value);
}

const getSetting = (setting) => {
    return JSON.parse(localStorage.getItem(setting));
}

const setSetting = (setting, to) => {
    localStorage.setItem(setting, JSON.stringify(to));
}

const getBoards = () => {
    const boards = localStorage.getItem('boards');
    return JSON.parse(boards);
}

const addBoard = (board) => {
    let boards = getBoards();
    boards.push(board);
    localStorage.setItem(
        'boards',
        JSON.stringify(boards)
    );
}

const removeBoard = (board) => {
    localStorage.setItem(
        'boards',
        JSON.stringify(
            getBoards().filter(b =>
                b.name !== board.name
            )
        )
    );
}

const getRecords = () => {
    const records = localStorage.getItem('records');
    return JSON.parse(records);
}

// { name, board, time }
const addRecord = (record) => {
    let records = getRecords();
    records.push(record);
    localStorage.setItem(
        'records',
        JSON.stringify(records)
    );
}

const getSession = () => {
    return JSON.parse(localStorage.getItem('session'));
}

// { name, board, time }
const setSession = (session) => {
    if(session === null){
        localStorage.removeItem('session');
        return;
    }
    localStorage.setItem(
        'session',
        JSON.stringify(session)
    );
}

const resetStorage = () => {
    localStorage.removeItem('init');
    localStorage.removeItem('borads');
    localStorage.removeItem('records');
    localStorage.removeItem('session');
}

const msFormat = (ms) => {
    let min = Math.floor(ms / 60);
    let sec = ms - min*60; 
    let zero = '';
    if(sec < 10) zero = '0';
    return `${min}:${zero}${sec}`;
}

const init = () => {
    if(!localStorage.getItem('init')){
        let stockBoards = [
            {
                stock: true,
                name: 'Stock Easy',
                blackCells: [
                    { row: 0, col:3, number: 1 },
                    { row: 1, col:1, number: 0 },
                    { row: 1, col:5, number: 2 },
                    { row: 3, col:0 },
                    { row: 3, col:3 },
                    { row: 3, col:6 },
                    { row: 5, col:1 },
                    { row: 5, col:5, number: 2 },
                    { row: 6, col:3, number: 3 }
                ]
            },
            {
                stock: true,
                name: 'Stock Medium',
                blackCells: [
                    { row: 0, col:2, number: 0 },
                    { row: 0, col:4 },
                    { row: 2, col:0 },
                    { row: 2, col:2 },
                    { row: 2, col:4, number: 3 },
                    { row: 2, col:6 },
                    { row: 3, col:3, number: 1 },
                    { row: 4, col:0, number: 2 },
                    { row: 4, col:2 },
                    { row: 4, col:4 },
                    { row: 4, col:6 },
                    { row: 6, col:2 },
                    { row: 6, col:4, number: 2 }
                ]
            },
            {
                stock: true,
                name: 'Stock Hard',
                size: { rows: 10, cols: 10 },
                blackCells: [
                    { row: 0, col: 1 },
                    { row: 1, col: 5, number: 3 },
                    { row: 1, col: 7, number: 2 },
                    { row: 1, col: 9 },
                    { row: 2, col: 1, number: 0 },
                    { row: 2, col: 2 },
                    { row: 2, col: 7 },
                    { row: 3, col: 4 },
                    { row: 4, col: 1, number: 1 },
                    { row: 4, col: 4 },
                    { row: 4, col: 5, number: 1 },
                    { row: 4, col: 6 },
                    { row: 5, col: 3 },
                    { row: 5, col: 4 },
                    { row: 5, col: 5 },
                    { row: 6, col: 5 },
                    { row: 7, col: 2, number: 1 },
                    { row: 7, col: 7, number: 0 },
                    { row: 7, col: 8 },
                    { row: 8, col: 0, number: 3 },
                    { row: 8, col: 2 },
                    { row: 8, col: 4, number: 0 },
                    { row: 9, col: 8, number: 0 },
                ]
            }
        ];
        setSetting('boards', stockBoards);
        setSetting('records', []);
        setSetting('init', 'yes');
        
        setSetting('round', 8);
        setSetting('spacing', 4);
        setSetting('board-spacing', 1);
    }
    setProperty('round', `${getSetting('round')/10}em`);
    setProperty('spacing', `${getSetting('spacing')/10}em`);
    setProperty('board-spacing', `${getSetting('board-spacing')/10}em`);
}

export {
    setProperty,
    getSetting, setSetting,
    getBoards, addBoard,
    removeBoard, resetStorage,
    getRecords, addRecord,
    getSession, setSession,
    msFormat, init
}