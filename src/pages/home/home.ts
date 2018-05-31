import { Component } from '@angular/core';
import { NavController, AlertController, NavParams, LoadingController, Loading, ModalController } from 'ionic-angular';
import { LocationTrackerProvider } from '../../providers/location-tracker/location-tracker';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { Facebook } from '@ionic-native/facebook';
import { IntervalPage } from '../setting/interval/interval';
import { TimeoutPage } from '../setting/timeout/timeout';
import { GpsPage } from '../setting/gps/gps';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Storage} from "@ionic/storage";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

    loading: Loading;  
    public timeout: any;
    public interval: any;
    public accuracy: any;
    public username: string;
    public email: string;

    constructor(           
        public navCtrl: NavController, 
        public locationTrackerProvider : LocationTrackerProvider,
        public facebook: Facebook,
        public navParams: NavParams,
        public firebaseProvider: FirebaseProvider,
        public loadingCtrl: LoadingController,
        public alertCtrl: AlertController,  
        private iab: InAppBrowser,   
        private storage : Storage,  
    ) 
    {
    }
    ionViewDidLoad(){
       
    }   
    ionViewWillEnter(){
        this.username = this.firebaseProvider.userData.username;
        this.email = this.firebaseProvider.userData.email;
        this.setting();
    }

    setting(){

        switch(this.firebaseProvider.timeout) {
         
            case 43200:
                this.timeout  = '12 Hours';
                break;
            case 86400:
                this.timeout  = '24 Hours';
                break;
            case 172800:
                 this.timeout  = '48 Hours';
                break;
            case 259200:
                this.timeout  = '72 Hours';
                break;
            case 345600:
                this.timeout  = '96 Hours';
                break;
        }
        
        switch(this.locationTrackerProvider.gps) {
            case 0:    
                this.accuracy = 'High';
            break;
            case 10:
                this.accuracy = 'Medium';
            break;
            case 100:
                this.accuracy = 'Low';
            break;
            case 1000:
                this.accuracy = 'Extra Low';
            break;
        }

        switch(this.firebaseProvider.interval) {
            case 60:
                this.interval = '1 Minute';
            break;
            case 120:
                this.interval = '2 Minutes';
            break;
            case 300:               
                this.interval = '5 Minutes';
            break;
            case 600:               
                this.interval = '10 Minutes';
            break;
            case 1200:               
                this.interval = '20 Minutes';
            break;
            case 1800:
                this.interval = '30 Minutes';
            break;
            case 3600:              
                this.interval = '1 Hour';
            break;
        }
    }
    
    openPage(page){
        if(page == 'interval'){

            this.navCtrl.push(IntervalPage, {
                interval : this.interval
              }
            );
        }
        else if(page =='gps'){
            this.navCtrl.push(GpsPage, {
                accuracy : this.accuracy
            });
        }
        else if(page =='timeout'){
            this.navCtrl.push(TimeoutPage, {
                timeout : this.timeout
            });
        }
        else if(page =='reset'){
            let confirm = this.alertCtrl.create({
                title: 'Setting Reset?',
                buttons: [
                    {
                        text: 'No',
                        handler: () => {
                            console.log('Disagree clicked');
                        }
                    },
                    {
                        text: 'Yes',
                        handler: () => {
                           this.reset();
                        }
                    }
                ]
            });
            confirm.present();           
        }
        else if(page =='help'){
            const browser = this.iab.create('https://www.safekeeping.io');
            browser.show();
        }
    }

    reset()
    {
        this.firebaseProvider.interval = 60;
        this.firebaseProvider.timeout = 43200;
        this.locationTrackerProvider.gps = 10;
        this.locationTrackerProvider.highAccuracy = true;
        this.storage.set('interval', 60);
        this.storage.set('timeout', 43200);
        this.storage.set('gps', 10);
        this.storage.set('high', 60);
    }
}
