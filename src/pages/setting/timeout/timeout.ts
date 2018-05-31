import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FirebaseProvider } from '../../../providers/firebase/firebase';
import { SettingProvider } from '../../../providers/setting/setting';
import { Storage} from "@ionic/storage";
/**
 * Generated class for the TimeoutPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-timeout',
  templateUrl: 'timeout.html',
})
export class TimeoutPage {
  public times : Array<{item: string}>;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public firebaseProvider: FirebaseProvider,   
    public settingProvider : SettingProvider,
    private storage : Storage,  
  )
  {
    let time = navParams.get('timeout');
    let times =[    
      { item: '12 Hours'},
      { item: "24 Hours"},
      { item: '48 Hours'},
      { item: '72 Hours'},
      { item: '96 Hours'}, 
    ];       

    times.forEach(element => {
    
        if(element['item'] == time){
          element['checked']  = true;
        }
        else{
          element['checked']  = false;
        }             
    });   
      
    this.times = times;    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TimeoutPage');
  }

  select(item){
     console.log(item);
    switch(item) {
      case '12 Hours':
        this.firebaseProvider.timeout = 43200;
        this.storage.set('timeout', 43200);
        break;
      case '24 Hours':
        this.firebaseProvider.timeout = 86400;
        this.storage.set('interval', 86400);
        break;
      case '48 Hours':
        this.firebaseProvider.timeout = 172800;
        this.storage.set('timeout', 172800);
        break;
      case '72 Hours':
        this.firebaseProvider.timeout = 259200;
        this.storage.set('timeout', 259200);
        break;
      case '96 Hours':
        this.firebaseProvider.timeout = 345600;
        this.storage.set('timeout', 345600);
        break;
    }
  }

}
