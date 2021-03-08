import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  @Input() size: string;
  @Input() backgroundColor: string;
  @Input() elevated = true;
  @Input() fixed = false;

  textColor: string;
  constructor() {}

  ngOnInit(): void {
    const navbarElement = document.querySelector('.navbar') as HTMLDivElement;
    switch (this.size) {
      case 'small':
        navbarElement.style.height = '46px';
        navbarElement.style.lineHeight = '46px';
        navbarElement.classList.add('small');
        break;
      case 'medium':
        navbarElement.style.height = '56px';
        navbarElement.style.lineHeight = '56px';
        navbarElement.classList.add('medium');
        break;
      case 'large':
        navbarElement.style.height = '66px';
        navbarElement.style.lineHeight = '66px';
        navbarElement.classList.add('large');
        break;
      default:
        navbarElement.style.height = '56px';
        navbarElement.style.lineHeight = '56px';
        navbarElement.classList.add('medium');
    }
    switch (this.backgroundColor) {
      case 'bg-primary':
        navbarElement.classList.add('bg-primary');
        navbarElement.childNodes.forEach((x) => {
          const node = x.childNodes;
          let i = 0;
          for (; i < node.length; i++) {
            const nodeElement = node[i];
            nodeElement.childNodes.forEach((c) => {
              const node2 = c.childNodes;
              node2.forEach((v) => {
                const node3 = v as HTMLDivElement;
                const color = getComputedStyle(document.body).getPropertyValue(
                  '--primary'
                );
                node3.style.color = this.getContrastYIQ(color.trim());
              });
            });
          }
        });
        break;
      case 'bg-secondary':
        navbarElement.classList.add('bg-secondary');
        navbarElement.childNodes.forEach((x) => {
          const node = x.childNodes;
          let i = 0;
          for (; i < node.length; i++) {
            const nodeElement = node[i];
            nodeElement.childNodes.forEach((c) => {
              const node2 = c.childNodes;
              node2.forEach((v) => {
                const node3 = v as HTMLDivElement;
                const color = getComputedStyle(document.body).getPropertyValue(
                  '--secondary'
                );
                node3.style.color = this.getContrastYIQ(color.trim());
              });
            });
          }
        });
        break;
      case undefined:
        break;
      default:
        navbarElement.style.backgroundColor = this.backgroundColor;
        navbarElement.classList.add('medium');
        navbarElement.childNodes.forEach((x) => {
          const node = x.childNodes;
          let i = 0;
          for (; i < node.length; i++) {
            const nodeElement = node[i];
            nodeElement.childNodes.forEach((c) => {
              const node2 = c.childNodes;
              node2.forEach((v) => {
                const node3 = v as HTMLDivElement;
                node3.style.color = this.getContrastYIQ(this.backgroundColor);
              });
            });
          }
        });
        break;
    }
    if (this.elevated) {
      navbarElement.classList.add('elevation');
    } else {
      navbarElement.classList.remove('elevation');
    }
    if (this.fixed) {
      navbarElement.classList.add('fixed');
      const outWrap = document.getElementById('wrap-1');
      outWrap.style.height = navbarElement.offsetHeight.toString() + 'px';
    }
  }

  getContrastYIQ(hexcolor): string {
    hexcolor = hexcolor.replace('#', '');
    const r = parseInt(hexcolor.substr(0, 2), 16);
    const g = parseInt(hexcolor.substr(2, 2), 16);
    const b = parseInt(hexcolor.substr(4, 2), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 125 ? 'black' : 'white';
  }
}

export class SizeEnum {
  small = 1;
  medium = 2;
  big = 3;
}