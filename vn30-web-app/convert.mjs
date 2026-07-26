import fs from 'fs';
import path from 'path';

function convertHtmlToReact(htmlString, componentName) {
  // Extract content inside <!-- Dashboard Content --> or similar down to end of main
  let content = htmlString;
  const match = htmlString.match(/<!-- (?:Dashboard Content|Main Content|Stock Detail Content|Portfolio Content) -->([\s\S]*?)<\/main>/);
  if (match) {
    content = match[1];
  } else {
    const matchLogin = htmlString.match(/<body[^>]*>([\s\S]*?)<\/body>/);
    if(matchLogin) content = matchLogin[1];
  }

  // Remove sidebar/header if present inside the match (shouldn't be, based on regex but just in case)
  content = content.replace(/<!-- SideNavBar[\s\S]*?<\/aside>/, '');
  content = content.replace(/<!-- TopNavBar[\s\S]*?<\/header>/, '');

  // Convert class= to className=
  content = content.replace(/class=/g, 'className=');
  // Self close img and input
  content = content.replace(/<img([^>]*[^/])>/g, '<img$1 />');
  content = content.replace(/<input([^>]*[^/])>/g, '<input$1 />');
  content = content.replace(/<!--[\s\S]*?-->/g, ''); // remove comments to avoid issues
  content = content.replace(/<script[\s\S]*?<\/script>/gi, ''); // remove script tags entirely
  content = content.replace(/xmlns="[^"]*"/g, ''); // remove xmlns attributes which might cause warnings
  content = content.replace(/style="([^"]*)"/g, (match, styleString) => {
    const styles = styleString.split(';').filter(s => s.trim());
    const styleObj = {};
    styles.forEach(s => {
      let [key, value] = s.split(':');
      if(key && value) {
        key = key.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        styleObj[key] = value.trim();
      }
    });
    return `style={${JSON.stringify(styleObj)}}`;
  });

  return `export default function ${componentName}() {
  return (
    <>
      ${content}
    </>
  );
}`;
}

const basePath = 'd:/BigData/du-an-chung-khoan/stitch_interface_deployment_system_extracted/stitch_interface_deployment_system';
const outPath = 'd:/BigData/du-an-chung-khoan/vn30-web-app/src/pages';

const pages = [
  { dir: 't_ng_quan_th_tr_ng_vn30', name: 'Dashboard' },
  { dir: 'chi_ti_t_c_phi_u_ai_d_o_n', name: 'StockDetail' },
  { dir: 'danh_m_c_theo_d_i_c_nh_n', name: 'Portfolio' },
  { dir: 'ng_nh_p_h_th_ng', name: 'Login' },
];

pages.forEach(page => {
  const htmlPath = path.join(basePath, page.dir, 'code.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  const reactCode = convertHtmlToReact(html, page.name);
  fs.writeFileSync(path.join(outPath, `${page.name}.jsx`), reactCode);
});

console.log('Conversion complete');
