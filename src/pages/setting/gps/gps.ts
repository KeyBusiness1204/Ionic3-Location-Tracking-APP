import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { LocationTrackerProvider } from '../../../providers/location-tracker/location-tracker';
import { SettingProvider } from '../../../providers/setting/setting';
import { Storage} from "@ionic/storage";

/**
 * Generated class for the GpsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-gps',
  templateUrl: 'gps.html',
})
export class GpsPage {

  public levels : Array<{item: string}>;
  public checked : boolean;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public locationTrackerProvider: LocationTrackerProvider,
    public settingProvider : SettingProvider,
    private storage : Storage,    
  )
  {
    let level = navParams.get('accuracy');

    let levels =[
      { item: 'High'},
      { item: 'Medium'},      
      { item: 'Low'},
      { item: "Extra Low"}
    ];

    levels.forEach(element => {
      
         if(element['item'] == level){
            element['checked']  = true;
         }
         else{
           element['checked']  = false;
         }             
     });   
     
     this.levels = levels;    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GpsPage');
  }

  select(item){
    
    switch(item) {
      case 'High':
          this.locationTrackerProvider.gps = 0;
          this.locationTrackerProvider.highAccuracy = true;
          this.storage.set('gps', 0);
          this.storage.set('high', true);
        break;
      case 'Medium':
          this.locationTrackerProvider.gps = 10;
          this.locationTrackerProvider.highAccuracy = false;
          this.storage.set('gps', 10);
          this.storage.set('high', false );
        break;
      case 'Low':
        this.locationTrackerProvider.gps = 100;
        this.locationTrackerProvider.highAccuracy = false;
        this.storage.set('gps', 100);
        this.storage.set('high', false);
        break;
      case 'Extra Low':
        this.locationTrackerProvider.gps = 1000;
        this.locationTrackerProvider.highAccuracy = false;
        this.storage.set('gps', 1000);
        this.storage.set('high', false);
        break;
  }
}


}
