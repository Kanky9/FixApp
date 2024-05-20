import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {FormGroup,FormBuilder,Validators,FormControl,} from '@angular/forms';
import { Product } from 'src/app/models/product.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { User } from 'firebase/auth';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-editar-publicacion',
  templateUrl: './editar-publicacion.component.html',
  styleUrls: ['./editar-publicacion.component.scss'],
})
export class EditarPublicacionComponent implements OnInit {
  productId: string;
  isEditing: boolean = false;

  form = new FormGroup({
    id: new FormControl(''),
    imagePrincipal: new FormControl('', [Validators.required]),
    nombre: new FormControl('', [Validators.required, Validators.minLength(3)]),
    imagenes: new FormControl([]),
    categoria: new FormControl('', [Validators.required]),
    area: new FormControl('', [Validators.required]),
    descripcion: new FormControl('', [Validators.required]),
    ubicacion: new FormControl('', [
      Validators.required,
      Validators.minLength(4),
    ]),
    direccion: new FormControl('', [
      Validators.required,
      Validators.minLength(4),
    ]),
    telefono: new FormControl(null, [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(10),
    ]),
  });

  user = {} as User;
  product = {} as Product;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService
  ) {}

  ngOnInit(): void {
    this.user = this.utilsSvc.getFromLocalStorage('user');

    this.route.params.subscribe((params) => {
      if (params['productId']) {
        this.productId = params['productId'];
        this.isEditing = true;
        this.loadProductDetails();
      }
    });
  }

  loadProductDetails() {
    this.firebaseSvc
      .getDocument(`products/${this.productId}`)
      .then((product: Product) => {
        this.product = product; // Almacenar el producto recuperado
        this.populateForm();
      })
      .catch((error) => {
        console.log('Error al obtener detalles del producto:', error);
      });
  }

  populateForm() {
    this.form.patchValue({
      imagePrincipal: this.product.imagePrincipal,
      nombre: this.product.nombre,
      imagenes: this.product.imagenes,
      categoria: this.product.categoria,
      area: this.product.area,
      descripcion: this.product.descripcion,
      ubicacion: this.product.ubicacion,
      direccion: this.product.direccion,
      telefono: this.product.telefono,
    });
  }

  async submit() {
    if (this.form.valid) {
      const loading = await this.utilsSvc.presentCustomLoading(
        'Actualizando Publicación...'
      );

      const product: Product = {
        productId: this.productId,
        userId: this.user.uid,
        imagePrincipal: this.form.value.imagePrincipal,
        nombre: this.form.value.nombre,
        imagenes: this.form.value.imagenes,
        categoria: this.form.value.categoria,
        area: this.form.value.area,
        descripcion: this.form.value.descripcion,
        ubicacion: this.form.value.ubicacion,
        direccion: this.form.value.direccion,
        telefono: this.form.value.telefono,
      };

      this.firebaseSvc
        .updateProduct(this.productId, product)
        .then(async (res) => {
          this.utilsSvc.presentToast({
            message: 'Publicación actualizada exitosamente',
            duration: 2500,
            color: 'success',
            position: 'middle',
            icon: 'checkmark-circle-outline',
          });

          this.form.reset();
          this.form.get('imagenes').setValue([]);
          this.form.get('imagenes').markAsUntouched();
          this.form.get('imagenes').markAsPristine();
        })
        .catch((error) => {
          console.log('Error al actualizar la publicación:', error);
          this.utilsSvc.presentToast({
            message: 'Error al actualizar la publicación',
            duration: 2500,
            color: 'danger',
            position: 'middle',
            icon: 'alert-circle-outline',
          });
        })
        .finally(() => {
          loading.dismiss();
        });
    }
  }

  /* ========== Categorías ========== */
  categorias = [
    {
      nombre: 'Comercio',
      areas: [
        'Alimentos gourmet',
        'Alimentos orgánicos',
        'Antigüedades',
        'Arte',
        'Artesanías',
        'Bicicletas',
        'Bricolaje',
        'Calzado',
        'Camping',
        'Carnicería',
        'Chocolatería',
        'Comida para llevar',
        'Comida rápida',
        'Comida sin gluten',
        'Cosméticos',
        'Deportes',
        'Dulces',
        'Electrónica',
        'Ferretería',
        'Florería',
        'Fotografía',
        'Frutería',
        'Informática',
        'Inmuebles',
        'Jardinería',
        'Juguetes',
        'Librería',
        'Mascotas',
        'Mercado',
        'Muebles',
        'Música',
        'Óptica',
        'Patinaje',
        'Pescadería',
        'Productos naturales',
        'Regalos',
        'Repostería',
        'Ropa',
        'Segunda mano',
        'Supermercado',
        'Surf',
        'Té y café',
        'Verdulería',
        'Vinos y licores',
      ],
    },
    {
      nombre: 'Deporte',
      areas: [
        'Atletismo',
        'Baloncesto',
        'Béisbol',
        'Boxeo',
        'Ciclismo',
        'Deportes acuáticos',
        'Deportes de aventura',
        'Deportes de combate',
        'Deportes de invierno',
        'Deportes de equipo',
        'Deportes de motor',
        'Deportes extremos',
        'Deportes individuales',
        'Deportes náuticos',
        'Equitación',
        'Esgrima',
        'Fútbol',
        'Gimnasio',
        'Golf',
        'Maratón',
        'Montañismo',
        'Natación',
        'Patinaje',
        'Rugby',
        'Skateboarding',
        'Surf',
        'Tenis',
        'Local de ventas',
        'Voleibol',
      ],
    },
    {
      nombre: 'Educación',
      areas: [
        'Academias de idiomas',
        'Academias de música',
        'Bibliotecas',
        'Centros de educación infantil',
        'Centros de educación primaria',
        'Centros de educación secundaria',
        'Centros de formación profesional',
        'Centros de idiomas',
        'Clases particulares',
        'Colegios',
        'Escuelas de arte',
        'Escuelas de cocina',
        'Escuelas de danza',
        'Escuelas de diseño',
        'Escuelas de fotografía',
        'Escuelas de informática',
        'Escuelas de negocios',
        'Escuelas de teatro',
        'Guarderías',
        'Instituciones de enseñanza superior',
        'Jardines de infancia',
        'Universidades',
      ],
    },
    {
      nombre: 'Entretenimiento',
      areas: [
        'Actividades al aire libre',
        'Animación infantil',
        'Arcades',
        'Bares de karaoke',
        'Cines',
        'Clubes nocturnos',
        'Conciertos',
        'Discotecas',
        'Escape rooms',
        'Eventos deportivos',
        'Eventos musicales',
        'Fiestas temáticas',
        'Gimnasios de escalada',
        'Juegos de mesa',
        'Juegos mecánicos',
        'Parques acuáticos',
        'Parques de diversiones',
        'Parques temáticos',
        'Pubs',
        'Salas de billar',
        'Salas de conciertos',
        'Salas de escape',
        'Salones de baile',
        'Teatros',
        'Zoológicos',
      ],
    },
    {
      nombre: 'Estética y Belleza',
      areas: [
        'Armonización',
        'Aromaterapia',
        'Auriculoterapia',
        'Bodi up',
        'Body health',
        'Botox',
        'Bronceado instantaneo',
        'Cabina solar',
        'Camuflaje de manchas',
        'Celulitis',
        'Constelacionies',
        'Criolifting facial',
        'Criolipolisis',
        'Crioradiofrecuencia',
        'Depilación definitiva',
        'Depilación masculina',
        'Depilación tradicional',
        'Dermapen con peptonas',
        'Dermapen con PRP',
        'Dermapen microneedling',
        'Dermaplaning',
        'Dermaplaning facial',
        'Dermaplaning y microneedling',
        'Dermaplaning y peptonas',
        'Dermaplaning y radiofrecuencia',
        'Drenaje linfático',
        'Esmalte permanente en pies',
        'Exfoliación espalda, piernas y pies',
        'Extensión de pestañas',
        'Eye lifting',
        'Face y body',
        'Fibrosis',
        'Flacidez',
        'Flores de bach',
        'Hifu 12D',
        'Hifu 9D',
        'Hifu intimo',
        'Hifu liposonix',
        'Hifu vaginal',
        'Hifu v-max',
        'Higiene facial profunda',
        'Hilos tensores',
        'Himfu reductor',
        'Hiperhidrosis con botox',
        'Laminado de Cejas',
        'Laser lumiia',
        'Laser soprano',
        'Lifting de Pestañas',
        'Limpieza Facial c/extracciones',
        'Liposonix 4D',
        'Liposonix gold 360',
        'Local',
        'Luz pulsada',
        'Manicuría',
        'Masaje drenante brasilero',
        'Masaje psicosensitivo',
        'Masaje reductor',
        'Masajes',
        'Masajes faciales',
        'Medicina ortomolecular',
        'Microglanding',
        'Ondas rusas',
        'Pecas tratamiento',
        'Peeling de ojeras y bolsas',
        'Peeling médico',
        'Pelling enzimático',
        'Pelling químico',
        'Perfilado de cejas',
        'Plasma frío',
        'Plasma Pen',
        'Podología',
        'Presoterapia',
        'Promociones',
        'Radiofrecuencia',
        'Radiofrecuencia facial',
        'Recuperación de pestañas',
        'Reflexología podal',
        'Regalos',
        'Reiki',
        'Relleno de labios',
        'Retiros acrílicos/poligel/softgel',
        'Rinomodelación',
        'Roll Active',
        'Sorteos',
        'Spa',
        'Spa de pies',
        'Terapia Shiatsu',
        'Trat. Capilares',
        'Trat. Despigmentante',
        'Trat. Modelador',
        'Trat. Ocular',
        'Trat. Rejuvenecedor facial',
        'Ultracavitación',
        'Uñas esculpidas',
        'Velaslim',
        'Ventas',
      ],
    },
    {
      nombre: 'Moda',
      areas: [
        'Accesorios',
        'Bisutería',
        'Calzado',
        'Complementos',
        'Confección a medida',
        'Confección de alta costura',
        'Confección de trajes de baño',
        'Confección de uniformes',
        'Confección infantil',
        'Confección masculina',
        'Confección unisex',
        'Cosméticos',
        'Disfraces',
        'General',
        'Lencería',
        'Moda deportiva',
        'Moda femenina',
        'Moda infantil',
        'Moda íntima',
        'Moda masculina',
        'Moda nupcial',
        'Moda para bebés',
        'Moda para embarazadas',
        'Moda para niños',
        'Moda sostenible',
        'Ropa de trabajo',
        'Ropa informal',
        'Ropa para adolescentes',
        'Ropa para adultos mayores',
        'Ropa para niños',
        'Ropa premamá',
        'Sombrerería',
        'Tallas grandes',
        'Uniformes escolares',
        'Vestuario teatral',
        'Zapatería',
      ],
    },
    {
      nombre: 'Salud',
      areas: [
        'Alergista',
        'Anatomía patológica',
        'Anestesiología',
        'ART',
        'Banco de Sangre',
        'Cardiología',
        'Centro de cirugía plástica y reparadora',
        'Centro oncológico',
        'Centros de salud municipal',
        'Cirugía cardiovascular',
        'Cirugía general',
        'Cirugía maxilofacial',
        'Cirugía mini invasiva',
        'Cirugía oral',
        'Cirugía plástica',
        'Cirugía torácica',
        'Cirugía vascular periférica',
        'Clínica',
        'Clínica general',
        'Consultorio externo',
        'Deportología',
        'Dermatología',
        'Diabetología',
        'Diagnóstico por imagen',
        'Diálisis',
        'Electrofisiología',
        'Electromiografía',
        'Endocrinología',
        'Endocrinólogo',
        'Especialista en hombros y rodillas',
        'Estimulación temprana',
        'Fisiatría',
        'Flebología',
        'Fonoaudiología',
        'Fototerapia',
        'Gastroenterología',
        'Gerentología',
        'Hematología',
        'Hemodinamia',
        'Hepatología',
        'Hospital',
        'Inmunología',
        'Instituto diagnósticos',
        'Instituto radiología',
        'Kinesiología',
        'Laboratorio',
        'Lase en oftalmología',
        'Masología',
        'Medicina ayurveda',
        'Medicina laboral',
        'Medicina reproductiva',
        'Mesoterapia',
        'Nefrología',
        'Neumonología',
        'Neuro cirugía',
        'Neurología',
        'Neuroortopedía',
        'Nutrición',
        'Obstetricia',
        'Odontología',
        'Oftalmología',
        'Oncología',
        'Ortesis plantares',
        'Otorrinnolaringología',
        'PAMI dentro de los sanatorios',
        'Pediatría y meonatología',
        'Psicología',
        'Psicopedagogía',
        'Psiquiatría',
        'Quiropraxia',
        'Radioterápia oneológica',
        'Rehabilitación vestibular',
        'Reumatología',
        'Sanatorio',
        'Servicio de ortopedia y traumatología',
        'Traumatología',
        'Urología',
      ],
    },
    {
      nombre: 'Tecnología',
      areas: [
        'Accesorios',
        'Audio',
        'Cámaras',
        'Celulares y teléfonos',
        'Componentes de PC',
        'Componentes electrónicos',
        'Conectividad y redes',
        'Consolas',
        'Desarrollo de aplicaciones móviles',
        'Desarrollo de software',
        'Diseño gráfico',
        'Diseño web',
        'Gestión de proyectos de TI',
        'Hardware',
        'Impresiones',
        'Ingeniería de sistemas',
        'Inteligencia artificial',
        'Mercado en línea de tecnología',
        'PC',
        'Realidad aumentada',
        'Realidad virtual',
        'Redes y comunicaciones',
        'Reparación de celulares',
        'Reparación de PC',
        'Reparación general',
        'Robótica',
        'Soporte técnico',
        'Tecnologías de la información',
        'Testing de software',
        'Venta de productos tecnológicos',
        'Video',
        'Videojuegos',
        'Ventas',
      ],
    },
    // Agrega más categorías y áreas según necesites
  ];

  async takeImage() {
    const dataUrl = await this.utilsSvc.takePicture('imagen de la publicación');
    this.form.controls.imagePrincipal.setValue(dataUrl);
  }

  async selectImages() {
    const maxImages = 6 - this.form.controls.imagenes.value.length;
    const selectedImage = await this.utilsSvc.takePicture(
      'Selecciona una imagen'
    );
    const currentImages = this.form.controls.imagenes.value;
    for (let i = 0; i < maxImages; i++) {
      this.form.controls.imagenes.setValue([...currentImages, selectedImage]);
    }
  }

  async removeImage(index: number) {
    const currentImages = this.form.controls.imagenes.value;
    currentImages.splice(index, 1);
    this.form.controls.imagenes.setValue(currentImages);
  }

  getCategoriaAreas(categoriaNombre: string): string[] {
    const categoria = this.categorias.find((c) => c.nombre === categoriaNombre);
    return categoria ? categoria.areas : [];
  }

  areas: string[] = [];

  categoriaSeleccionada(categoriaNombre: string) {
    const categoriaSeleccionada = this.categorias.find(
      (categoria) => categoria.nombre === categoriaNombre
    );
    if (categoriaSeleccionada) {
      this.areas = categoriaSeleccionada.areas;
      // Resetea el área seleccionada cuando cambia la categoría
      this.form.get('area').patchValue('');
    }
  }
}
