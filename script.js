const NUMBER_OF_WALLPAPERS = 15;

class Wallpaper{
  constructor(){
    let imageId = JSON.parse(localStorage.getItem('imageId'));
    this.imageId = imageId ? imageId : '1';
    this.node = document.querySelector('#wallpaper');
    this.node.addEventListener('click', this._clicked.bind(this));
    this._image();
  }

  _prev(){
    this.imageId == 1 ?
      this.imageId = NUMBER_OF_WALLPAPERS :
      --this.imageId;
  }

  _next(){
    this.imageId == NUMBER_OF_WALLPAPERS ?
      this.imageId = 1 :
      ++this.imageId;
  }

  _clicked(event){
    event.ctrlKey ? this._next() : this._prev();
    localStorage.setItem('imageId', JSON.stringify(this.imageId));
    this._image();
  }

  _image(){
    this.node.style.backgroundImage = `url('wallpapers/${this.imageId}')`;
    this.node.style.backgroundSize = 'cover';
  }
}

class Clock{
  constructor(){
    this.months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    this.days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

    this.clock = document.querySelector('#clock');
    this.month = document.querySelector('#month');
    this.date = document.querySelector('#date');
    setInterval(() => this._update(), 1000);
    this._update();
  }

  _update(){
    let date = new Date();
    let min = date.getMinutes();
    let day = date.getDate();
    this.clock.innerHTML = `${date.getHours()}:${min < 10 ? '0'+min : min}`;
    this.month.innerHTML = this.months[date.getMonth()];
    this.date.innerHTML = `${this.days[date.getDay()]} ${day < 10 ? '0'+day : day}.`
  }
}

new Wallpaper();
new Clock();