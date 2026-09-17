/* web-catalogo — los productos. Para añadir uno: una línea más, y su foto en img/ (cuadrada, 900 px).
   Precios en euros, número. La primera categoría de CATEGORIAS es la que se ve al entrar. */
const NEGOCIO = {
  nombre: "[Nombre de la panadería]",
  whatsapp: "34900000000",          // sin +, sin espacios: es el número al que llega el pedido
  correo: "hola@negocio.es",
  direccion: "[Calle y número], [barrio], [ciudad]",
  horario: "[L–S 7:00–14:30 · D 8:00–14:00]",
};
const CATEGORIAS = [["todo","Todo"],["pan","Pan"],["bolleria","Bollería"],["tartas","Tartas"],["salado","Salado"]];
const PRODUCTOS = [
  { id:"barra",      nombre:"Barra de masa madre",     cat:"pan",      precio:1.80, unidad:"unidad",     foto:"img/barra.jpg",      desc:"[Harina de trigo, masa madre de la casa, 24 horas de fermentación. Corteza crujiente, miga abierta.]", datos:[["Peso","300 g"],["Ingredientes","Harina, agua, masa madre, sal"],["Alérgenos","Gluten"]] },
  { id:"hogaza",     nombre:"Hogaza de centeno",       cat:"pan",      precio:4.20, unidad:"unidad",     foto:"img/hogaza.jpg",     desc:"[Centeno integral y trigo, corteza oscura, aguanta toda la semana.]", datos:[["Peso","800 g"],["Ingredientes","Centeno, trigo, agua, masa madre, sal"],["Alérgenos","Gluten"]] },
  { id:"croissant",  nombre:"Croissant de mantequilla", cat:"bolleria", precio:1.50, unidad:"unidad",     foto:"img/croissant.jpg",  desc:"[Mantequilla de verdad, hojaldrado a mano, horneado cada mañana.]", datos:[["Ingredientes","Harina, mantequilla, leche, huevo, azúcar, sal"],["Alérgenos","Gluten, lácteos, huevo"]] },
  { id:"napolitana", nombre:"Napolitana de chocolate", cat:"bolleria", precio:1.60, unidad:"unidad",     foto:"img/napolitana.jpg", desc:"[Hojaldre de mantequilla con chocolate negro.]", datos:[["Alérgenos","Gluten, lácteos, huevo, soja"]] },
  { id:"palmera",    nombre:"Palmera de chocolate",     cat:"bolleria", precio:2.20, unidad:"unidad",     foto:"img/palmera.jpg",    desc:"[La grande, de las de toda la vida, bañada en chocolate.]", datos:[["Alérgenos","Gluten, lácteos, soja"]] },
  { id:"tarta",      nombre:"Tarta de manzana",         cat:"tartas",   precio:18.00, unidad:"tarta entera (8 raciones)", foto:"img/tarta.jpg", desc:"[Manzana reineta en láminas sobre crema pastelera. Por encargo con un día de antelación.]", datos:[["Raciones","8"],["Encargo","24 h antes"],["Alérgenos","Gluten, lácteos, huevo"]] },
  { id:"empanada",   nombre:"Empanada de atún",         cat:"salado",   precio:12.50, unidad:"entera",     foto:"img/empanada.jpg",   desc:"[Masa fina, atún, pimiento y cebolla pochada. Para 6 personas.]", datos:[["Raciones","6"],["Alérgenos","Gluten, pescado"]] },
  { id:"rosquillas", nombre:"Rosquillas de anís",       cat:"bolleria", precio:6.00, unidad:"docena",      foto:"img/rosquillas.jpg", desc:"[Las de San Isidro, todo el año.]", datos:[["Unidades","12"],["Alérgenos","Gluten, huevo"]] },
];
