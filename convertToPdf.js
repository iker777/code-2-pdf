const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');


// Función para leer la entrada de la carpeta y alumno
const prompt = require('prompt-sync')();

const folderPath = '../'+ prompt('Nombre de la carpeta del examen del alumno:'); 
const nombreAlumno = prompt('Nombre del alumno:');

const outputPdfFile = `../examen_${nombreAlumno}.pdf`; // Archivo de salida

// Crear un nuevo documento PDF
const doc = new PDFDocument();
const stream = fs.createWriteStream(outputPdfFile);
doc.pipe(stream);

let firstPage = true; // Variable para manejar la primera página correctamente

// Función para obtener archivos de la carpeta actual y de subcarpetas (solo 1 nivel)
const getFilesOneLevelDeep = (dir) => {
    let fileList = [];

    // Leer archivos y carpetas en el directorio
    const items = fs.readdirSync(dir);

    items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);

        if (stat.isFile() && (item.endsWith('.html') || item.endsWith('.css') || item.endsWith('.js'))) {
            fileList.push(itemPath);
        } else if (stat.isDirectory()) {
            // Leer archivos de la subcarpeta (sin entrar en sub-subcarpetas)
            const subFiles = fs.readdirSync(itemPath)
                .filter(file => file.endsWith('.html') || file.endsWith('.css') || file.endsWith('.js'))
                .map(file => path.join(itemPath, file));
            
            fileList.push(...subFiles);
        }
    });

    return fileList;
};

// Obtener lista de archivos en la carpeta actual y subcarpetas (1 nivel)
const codeFiles = getFilesOneLevelDeep(folderPath);

if (codeFiles.length === 0) {
    console.log('No se encontraron archivos HTML, CSS o JavaScript.');
    doc.end();
} else {
    codeFiles.forEach(file => {
        const fileContent = fs.readFileSync(file, 'utf8');

        // Añade el nombre del alumno en la primera página
        if (firstPage) {
            doc.font('Helvetica-Bold')
               .fontSize(20)
               .text(`Alumno: ${nombreAlumno}`, { align: 'center' })
               .moveDown(2);
        }

        // Evitar que la primera página esté en blanco
        if (!firstPage) {
            doc.addPage();
        }
        firstPage = false;

        doc.font('Courier')
           .fontSize(10)
           .text(`Archivo: ${file}`, { underline: true })
           .moveDown()
           .text(fileContent, { width: 500, align: 'left' });

        console.log(`Archivo agregado al PDF: ${file}`);
    });

    doc.end();
    console.log('PDF generado con éxito:', outputPdfFile);
}
