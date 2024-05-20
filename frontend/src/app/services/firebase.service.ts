import { inject, Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth'; 
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail }  from 'firebase/auth';
import { User } from '../models/user.model';
import { AngularFirestore, DocumentData,  } from '@angular/fire/compat/firestore';
import { getFirestore, setDoc, doc, getDoc, addDoc, collection, collectionData, query, deleteDoc, updateDoc, DocumentSnapshot, DocumentReference } from '@angular/fire/firestore';
import { UtilsService } from './utils.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { getStorage, uploadString, ref, getDownloadURL } from 'firebase/storage'; 
import { Product } from '../models/product.model';
import firebase from 'firebase/compat/app';
import { Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {

  // Injecting necessary services
  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  storage = inject(AngularFireStorage);
  utilsSvc = inject(UtilsService);

  /* ==================== Autenticación ==================== */

  getAuth() {
    return getAuth();
  }

  /* ========== Acceder ========== */
  singIn(user: User) {
    return signInWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  /* ========== Crear Usuario ========== */
  singUp(user: User) {
    return createUserWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  /* ========== Actualizar Usuario ========== */
  updateUser(displayName: string) {
    return updateProfile(getAuth().currentUser, { displayName });
  }

  /* ========== Enviar mail para restablecer contraseña ========== */
  sendRecoveryEmail(email: string) {
    return sendPasswordResetEmail(getAuth(), email);
  }

  /* ========== Cerrar sesión ========== */
  singOut() {
    getAuth().signOut();
    localStorage.removeItem('user');
  }

  /* ==================== Base de Datos ==================== */

  /* ========== Obtener todos los productos ========== */
  getAllProducts() {
    return this.getCollectiondata('products');
  }

  /* ========== Agregar un producto ========== */
  async addProduct(product: Product) {
    return this.firestore.collection('products').add(product);
  }

  /* ========== Obtener un producto por ID ========== */
  async getProduct(productId: string) {
    return this.firestore
      .doc(`products/${productId}`)
      .get()
      .toPromise()
      .then((snapshot) => {
        if (snapshot.exists) { // Accede a la propiedad exists sin paréntesis
          return snapshot.data() as Product;
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.log('Error al obtener el producto:', error);
        return null;
      });
  }

  /* ========== Actualizar un producto ========== */
  updateProduct(productId: string, data: any) {
    return this.firestore.doc(`products/${productId}`).update(data);
  }



  /* ========== Eliminar un producto ========== */
  deleteProduct(productId: string) {
    return deleteDoc(doc(getFirestore(), `products/${productId}`));
  }

  /* ========== Obtener Documentos de una colección ========== */
  getCollectiondata(path: string, collectionQuery?: any) {
    const ref = collection(getFirestore(), path);
    return collectionData(query(ref, collectionQuery), {
      idField: 'productId',
    });
  }

  /* ========== Setear un Documento ========== */
  setDocument(path: string, data: any) {
    return setDoc(doc(getFirestore(), path), data);
  }

  /* ========== Obtener un Documento ========== */
  async getDocument(path: string) {
    return (await getDoc(doc(getFirestore(), path))).data();
  }

  /* ========== Agregar un Documento ========== */
  addDocument(path: string, data: any) {
    return addDoc(collection(getFirestore(), path), data);
  }

  /* ==================== Almacenamiento ==================== */

  /* ========== Subir Imagen ========== */
  async uploadImage(path: string, data_url: string) {
    return uploadString(ref(getStorage(), path), data_url, 'data_url').then(
      () => {
        return getDownloadURL(ref(getStorage(), path));
      }
    );
  }

  /* ========== Obtener el usuario actual ========== */
  async getCurrentUser(): Promise<firebase.User | null> {
    return new Promise((resolve, reject) => {
      this.auth.onAuthStateChanged(user => {
        resolve(user);
      }, reject);
    });
  }
  
  /* ========== Obtener el documento de un usuario ========== */
  async getUserDocument(uid: string) {
    return this.firestore.collection('users').doc(uid).get().toPromise();
  }

  /* ========== Actualizar un Documento ========== */
  async updateDocument(path: string, data: any) {
    return this.firestore.doc(path).update(data);
  }

  /* ========== Obtener todos los usuarios ========== */
  async getAllUsers() {
    const snapshot = await this.firestore.collection('users').get().toPromise();
    return snapshot.docs.map(doc => doc.data() as User);
  }

  /* ========== Actualizar documento de usuario ========== */
  updateUserDocument(uid: string, data: Partial<User>): Promise<void> {
    return this.firestore.doc<User>(`users/${uid}`).update(data);
  }

  async updateUserFavorites(uid: string, favorites: string[]) {
    return this.firestore.collection('users').doc(uid).update({ favorites: favorites || [] });
  }

  async getPublicationById(id: string) {
    const doc = await this.firestore.collection('publications').doc(id).get().toPromise();
    return doc.data();
  }

}