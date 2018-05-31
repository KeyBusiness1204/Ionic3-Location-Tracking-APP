import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FirebaseProvider } from '../../../providers/firebase/firebase';
import { SettingProvider } from '../../../providers/setting/setting';
import { Storage} from "@ionic/storage";
/**
 * Generated class for the IntervalPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-interval',
  templateUrl: 'interval.html',
})
export class IntervalPage {
  public intervals : Array<{item: string}>;
  public checked : boolean;
    constructor(
      public navCtrl: NavController,
      public navParams: NavParams,
      public firebaseProvider: FirebaseProvider,  
      public settingProvider : SettingProvider,
      private storage : Storage,   
    
    ) 
    {
      let interval = navParams.get('interval');
      let intervals =[
        { item: '1 Minute'},
        { item: '2 Minutes'},      
        { item: '5 Minutes'},
        { item: "10 Minutes"},
        { item: '20 Minutes'},
        { item: '30 Minutes'},
      ];

      intervals.forEach(element => {
        
           if(element['item'] == interval){
              element['checked']  = true;
           }
           else{
             element['checked']  = false;
           }             
       });   
       
       this.intervals = intervals;
  }

  ionViewDidLoad() {
    
  }

  select(item){
      console.log(item);
      switch(item) {
        case '1 Minute':
            this.firebaseProvider.interval = 60;
            this.storage.set('interval', 60);
          break;
        case '2 Minutes':
            this.firebaseProvider.interval = 120;
            this.storage.set('interval', 120);
          break;
        case '5 Minutes':
          this.firebaseProvider.interval = 300;
          this.storage.set('interval', 300);
          break;
        case '10 Minutes':
          this.firebaseProvider.interval = 600;
          this.storage.set('interval', 600);
          break;
        case '20 Minutes':
          this.firebaseProvider.interval = 1200;
          this.storage.set('interval', 1200);
          break;
        case '30 Minutes':
          this.firebaseProvider.interval = 1800;
          this.storage.set('interval', 1800);
          break;
        case '1 Hour':
          this.firebaseProvider.interval = 3600;
          this.storage.set('interval', 3600);
          break;
    }
  }

}
