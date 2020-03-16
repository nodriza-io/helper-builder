"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const server_1 = require("./server");
const builder = new server_1.Server({
    apiKey: process.env.API_KEY || '',
    account: process.env.ACCOUNT || '',
    port: process.env.PORT || '3000',
    model: process.env.PORT || 'proposal',
    defaultDocId: process.env.DOC_ID || ''
});
builder.setReloadAddPage(false);
builder.registerHelper('customTitle', function (name = "Nombre", city) {
    return `<h1 class="text-primary">...{{this.title}}</h1>`;
}, {
    description: 'Este helper muestra el titulo para las propuestas',
    argsDefinition: {
        name: 'Este parametro asigna el nombre',
        city: 'Este parametro es el label de la ciudad'
    }
});
builder.registerHelper('customName', function (salutation = "Sra.") {
    return `buenos dias ${salutation} {{this.relatedLead.firstName}} {{this.relatedLead.lastName}}`;
});
builder.registerHelper('customWilmar', function (name = "Wilmar Ibarguen") {
    return `buenos dias Sr. ${name}`;
}, {
    description: 'Este helper saludda formalmente a las empresas',
    argsDefinition: {
        name: 'Nombre de la empresa'
    }
});
builder.registerHelper('customTable', function (col1 = "Nombre", col2 = "Apellido") {
    return `
    <table>
      <thead>
        <th>${col1}</th>
        <th>${col2}</th>
      </thead>
      <tbody>
        <tr>
          <td>Wilmar</td>
          <td>Ibarguen</td>
        </tr>
        <tr>
          <td>Daniela</td>
          <td>Mosquera</td>
        </tr>
      </tbody>
    </table>
  `;
});
// console.log(builder.getHelpers())
builder.start();
//# sourceMappingURL=index.js.map