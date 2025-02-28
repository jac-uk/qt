const DEFAULT_STYLESHEET = `
  <style>
    body {
      font-family: Khula, HelveticaNeue, Arial, Helvetica, sans-serif;
      font-size: 1.1875rem;
    }
    th {
      color: #0B0C14;
      width: 50%;
      text-align: left;
      border-bottom: solid 1px #0B0C14;
      padding: 8px;
      vertical-align: top;
    }
    td {
      color: #0B0C14;
      border-bottom: solid 1px #0B0C14;
      padding: 8px;
    }
    table {
      border-spacing: 0;
      padding-bottom: 20px;
      width: 800px;
    }
    .sectionStart th, .sectionStart td {
      padding: 30px 8px 8px 8px;
    }
    h2 {
      padding-top: 10px;
    }
    h4 {
      padding-top: 30px;
    }
  </style>
`;

class htmlWriter {
  constructor() {
    this.html = '';
    this.stylesheet = '';
  }
  toString() {
    if (this.html !== '') {
      return this.pageHeader() + this.html + this.pageFooter();
    }
    return this.html;
  }
  pageHeader() {
    if (this.stylesheet === '') {
      return `<html><head>${DEFAULT_STYLESHEET}</head><body>`;
    } else {
      return `<html><head>${this.stylesheet}</head><body>`;
    }
  }
  pageFooter() {
    return '</body></html>';
  }
  setStylesheet(data) {
    this.stylesheet = data;
  }
  addTitle(data) {
    this.html += `<h2 id="title">${data}</h2>`;
  }
  addHeading(data) {
    // data = data.match(/[A-Z][a-z]+|[0-9]+/g).join(' ');
    this.html += `<h4 id="${data.split(' ').join('_')}_heading" >${data}</h4>`;
  }
  addTable(data) {
    const tableStart = '<table>';
    const tableEnd = '</table>';
    const rowStartSectionStart = '<tr class="sectionStart">';
    const rowStart = '<tr>';
    const rowEnd = '</tr>';
    const headingStart = '<th>';
    const headingEnd = '</th>';
    const dataStart = '<td>';
    const dataEnd = '</td>';

    const rowHtml = [];
    data.forEach(each => {
      const heading = each.label;
      let value = each.value;

      let html = each.lineBreak ? rowStartSectionStart : rowStart;
      html += headingStart + heading + headingEnd + dataStart + value + dataEnd + rowEnd;
      rowHtml.push(html);
    });
    rowHtml.unshift(tableStart);
    rowHtml.push(tableEnd);
    this.html += rowHtml.join('');
  }
  addParagraph(data) {
    this.html += `<p>${data}</p>`;
  }
}

export default htmlWriter;
