import { Component } from '@angular/core';
import { IonicPage, AlertController, ToastController, NavController, NavParams } from 'ionic-angular';
import { File } from '@ionic-native/file';

/**
 * Generated class for the DetailImgPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-detail-img',
  templateUrl: 'detail-img.html',
})
export class DetailImgPage {
  public imgsource : any;
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public alertCtrl: AlertController,
    private file: File,
    public toaster: ToastController,
  ) 
  {
      this.imgsource = navParams.get("url");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DetailImgPage');
  }

  deleteImg(imgsource){
    
      let confirm = this.alertCtrl.create({
        title: 'Image delete?',
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

                    var txtUrl = imgsource.filename+'.jpg';                 
                    this.file.removeFile(this.file.dataDirectory , txtUrl).then((res) =>{ 
                        this.presentToast('delete success.');
                        // this.downloadImage(imgsource.user);
                    });
                }
            }
        ]
    });
    confirm.present();
  }

  private presentToast(text) {
    
    let toast = this.toaster.create({
        message: text,
        duration: 3000,
        position: 'top'
    });
    toast.present();
  }

}
