import { NgZone, Component } from '@angular/core';
import { IonicPage, Platform, NavController,ActionSheetController,LoadingController,NavParams, Loading,  AlertController,ToastController, ModalController } from 'ionic-angular';
import { Camera } from '@ionic-native/camera';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { InviterPage } from '../inviter/inviter';
import { DetailImgPage } from '../detail-img/detail-img';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';
import { Facebook ,FacebookLoginResponse} from '@ionic-native/facebook';
import { File } from '@ionic-native/file';
import firebase from 'firebase';

declare var cordova: any;
@IonicPage()
@Component({
  selector: 'page-image',
  templateUrl: 'image.html',
})
export class ImagePage {

  public imgsources: any;
  public captureDataUrl : string;
  loading: Loading;    
  firestore = firebase.storage();
  public storageDirectory : string;

  constructor(
    public  platform: Platform,
    public zone: NgZone,
    public navCtrl: NavController,
    public navParams: NavParams,
    public actionSheetCtrl: ActionSheetController,
    private camera: Camera,
    public loadingCtrl: LoadingController,
    public firebaseProvider: FirebaseProvider,
    public modalCtrl: ModalController,
    private transfer: FileTransfer,
    public alertCtrl: AlertController,
    private file: File,
    public toaster: ToastController,
  )
  {
    this.platform.ready().then(() => {
        // make sure this is on a device, not an emulation (e.g. chrome tools device mode)
        if(!this.platform.is('cordova')) {
            return false;
        }

        if (this.platform.is('ios')) {
            this.storageDirectory = cordova.file.dataDirectory;
        }
        else if(this.platform.is('android')) {
            this.storageDirectory = cordova.file.externalApplicationStorageDirectory;
        }
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ImagePage');
  }

  imageView(imageUrl){
    this.navCtrl.push(DetailImgPage, { 
        url : imageUrl
    });
  }

  public presentActionSheet() {
      let actionSheet = this.actionSheetCtrl.create({
          title: 'Select Image Source',
          buttons: [
          {
              text: 'Load from Library',
              handler: () => {
                  this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
              }
          },
          {
              text: 'Use Camera',
              handler: () => {
                  this.takePicture(this.camera.PictureSourceType.CAMERA);
              }
          },
          {
              text: 'Cancel',
              role: 'cancel'
          }]
      });
      actionSheet.present();
  }

  public takePicture(sourceType) {
      
      // Create options for the Camera Dialog
      var options = {
          quality: 100,
          sourceType: sourceType,
          saveToPhotoAlbum: false,
          correctOrientation: true,
          destinationType: this.camera.DestinationType.DATA_URL,
          encodingType: this.camera.EncodingType.JPEG,
          mediaType: this.camera.MediaType.PICTURE,
      };
    
      // Get the data of an image
      this.camera.getPicture(options).then((imagePath) => {
          
          this.captureDataUrl = 'data:image/jpeg;base64,' + imagePath;        
      }, (err) => {
        this.presentToast('Selecting image canceled.');
      });
  }

  public uploadImage() {

      if(this.captureDataUrl != undefined){
          
          let storageRef = firebase.storage().ref();
          var filename = Math.floor(Date.now() / 1000);
          // Create a reference to 'images/todays-date.jpg'
          const imageRef = storageRef.child(`images/${filename}.jpg`);

          this.loading = this.loadingCtrl.create({
              content: 'Uploading...',
          });
          this.loading.present();

          imageRef.putString(this.captureDataUrl, firebase.storage.StringFormat.DATA_URL).then((snapshot)=> {
              
              this.loading.dismissAll()
              this.presentToast('Upload Success!');
            
              this.firestore.ref().child(`images/${filename}.jpg`).getDownloadURL().then((url) => {
                  this.zone.run(() => {
                      var imgUrl = { url : url, filename: filename };
                      this.firebaseProvider.imageUrls(imgUrl); 
                  })
              })
          }, (err) => {
              this.loading.dismissAll();
              this.presentToast('Upload Failed!');
          });     
      }
      else{
          this.showAlert('Please select an image.');
      }
  }

  downloadImageByAccount(){

      let profileModal = this.modalCtrl.create(InviterPage, { title: "Invite" });
      profileModal.present();

      profileModal.onDidDismiss(data => {
          if (data) {
              this.downloadImage( data.username);
          }
      });  
  }

  downloadImage(invite) {

      var that = this;
      this.imgsources = new Array();
      var query = firebase.database().ref("image_urls/"+ invite).orderByKey();
      query.once("value").then(function(snapshot) {
          
          if(snapshot.val() != null){                
              that.loading = that.loadingCtrl.create({
                  content: 'Downloading...',
              });
              that.loading.present();

              const fileTransfer: FileTransferObject = that.transfer.create();
              snapshot.forEach(function(childSnapshot) {               
                  
                  var imgUrl = childSnapshot.val().url;
                  var filename = childSnapshot.val().filename;
                  that.imgsources.push(childSnapshot.val());  
                  if(imgUrl != undefined){                 
                 
                      fileTransfer.download(imgUrl, that.storageDirectory +`${filename}.jpg`).then((entry) => {
                         that.firebaseProvider.sendDatas.push(that.storageDirectory + (filename + ".jpg"));
                        that.loading.dismissAll()
                      }, (error) => {
                          console.log('Uploaded image nothing');
                      });
                  } 
              });
          }
          else{
                that.imgsources = null;
                that.showAlert('Uploaded image nothing');                
          }
      });
      
  }  

  showAlert(text) {
    
    let alert = this.alertCtrl.create({
    title: 'Warning!',
    subTitle: text,
    buttons: [{
        text: "OK",
    }]
    });
    alert.present();
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
