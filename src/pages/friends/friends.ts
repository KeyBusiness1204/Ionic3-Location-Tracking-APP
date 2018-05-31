import { Component } from '@angular/core';
import { IonicPage, ViewController, NavController, NavParams } from 'ionic-angular';
import { Facebook,FacebookLoginResponse} from '@ionic-native/facebook';
import { FirebaseProvider } from '../../providers/firebase/firebase';

/**
 * Generated class for the FriendsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-friends',
  templateUrl: 'friends.html',
})
export class FriendsPage {

  public items: any;
  public installed_User: number;
  public total: number;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public firebaseProvider: FirebaseProvider,
    public facebook: Facebook,
    public viewCtrl: ViewController,
  ) 
  {

  }
  ionViewDidLoad() {
    this.facebook.api( this.firebaseProvider.userData.id +'/friends', []).then(response => {  
      
      this.items = response.data;
      this.installed_User = this.items.length;     
    });   
  }

  friend(id) {
      this.viewCtrl.dismiss(id);
  }

  cancel() {
      this.viewCtrl.dismiss();
  }

}
