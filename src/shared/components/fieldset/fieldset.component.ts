import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  OnInit,
} from '@angular/core';
import { FormControlName, NgModel } from '@angular/forms';

@Directive({
  selector: '[app-input], [p-input], [pInput]',
})
export class InputDirective {
  constructor(private el: ElementRef) {}
  @HostListener('focus', ['$event']) onFocus(event) {
    const input = this.el.nativeElement.parentElement.parentElement
      .parentElement as HTMLInputElement;
    input.classList.add('focused');
    const label = input.firstChild.nextSibling.firstChild as HTMLSpanElement;
    label.classList.add('active');
  }
  @HostListener('blur', ['$event']) onFocusOut(event) {
    const input = this.el.nativeElement.parentElement.parentElement
      .parentElement as HTMLInputElement;
    input.classList.remove('focused');
    const inputFil = this.el.nativeElement as HTMLInputElement;
    const label = input.firstChild.nextSibling.firstChild as HTMLSpanElement;
    if (inputFil.value.length === 0) {
      label.classList.remove('active');
    }
  }

  @HostBinding('class.form-input')
  get val() {
    return true;
  }
}

@Component({
  selector: 'app-fieldset, p-fieldset',
  templateUrl: './fieldset.component.html',
  styleUrls: ['./fieldset.component.css'],
})
export class FieldsetComponent
  implements OnInit, AfterViewInit, AfterContentInit
{
  @Input('pFieldsetLabelText') labelText: string;
  @Input('pFieldsetLabelActive') labelActive = false;
  @Input() hasHelperText = false;
  @Input() helperText: string;
  @Input() helperState: string;
  @Input() inputValidate = false;
  @Input('pFieldsetAppearence') appearence: string;
  @Input('pFieldsetInput') input: any;

  @ContentChildren('prefixContent') prefixContent: any;
  @ContentChildren('suffixContent') suffix: any;

  private required = 'required';
  private maxlengthValid = 'maxlength';
  private minlengthValid = 'minlength';
  private email = 'email';

  private Errors = {};
  public field: any;
  public message = '';

  hasPrefix = false;
  hasSuffix = false;

  @ContentChild(FormControlName, { static: false })
  control: FormControlName;
  @ContentChild(NgModel, { static: false })
  model: NgModel;

  constructor(private el: ElementRef) {
    this.seedMessages();
  }

  public seedMessages(): void {
    this.Errors[this.required] = (obj: FieldsetComponent) =>
      `O campo '${obj.labelText}' é obrigatório`;
    this.Errors[this.maxlengthValid] = (obj: FieldsetComponent) =>
      `O campo '${obj.labelText}' excedeu o limite de caracteres`;
    this.Errors[this.minlengthValid] = (obj: FieldsetComponent) =>
      `O campo '${obj.labelText}' não atingiu o mínimo de caracteres`;
    this.Errors[this.email] = (obj: FieldsetComponent) => `E-mail inválido`;
  }

  ngOnInit(): void {
    if (this.labelActive) {
      this.labelsActive();
    }
  }

  ngAfterViewInit(): void {
    if (this.hasHelperText) {
      this.changeIcon();
    }
  }

  public hasError(): boolean {
    if (this.field !== undefined) {
      if (this.field.errors) {
        this.hasHelperText = true;
        const error = Object.getOwnPropertyNames(this.field.errors);
        error.forEach((element) => {
          if (this.Errors[element]) {
            this.message += this.Errors[element](this);
          }
        });
        this.helperText = this.message;
        this.message = '';
      }
      return this.field.invalid && (this.field.dirty || this.field.touched);
    }
  }

  ngAfterContentInit(): void {
    this.field = this.control || this.model;
    if (this.field === undefined && this.inputValidate) {
      throw new Error(
        'Esse componente precisa ser usado com uma diretiva NgModel ou FormControlName. Utilize o atributo isException para esconder este erro.'
      );
    }
    // this.hasPrefix = this.prefix.nativeElement.childNodes.length > 0;
    console.log(this.prefixContent);
    console.log(this.suffix);
    this.hasSuffix = this.suffix.nativeElement;
  }

  labelsActive(): void {
    const label =
      this.el.nativeElement.firstChild.firstChild.firstChild.firstChild
        .nextSibling.firstChild;
    label.classList.add('active');
  }

  changeIcon(): void {
    const icon = document.querySelector('.helper-icon') as HTMLDivElement;
    switch (this.helperState) {
      case 'success':
        icon.innerHTML = 'check';
        break;
      case 'warn':
        icon.innerHTML = 'report_problem';
        break;
      case 'error':
        icon.innerHTML = 'close';
        break;
      default:
        icon.innerHTML = 'info';
    }
  }

  @HostListener('click', ['$event']) focused(event) {
    const target = event.target;
    if (
      target.classList.contains('input-wrapper') ||
      target.classList.contains('form-input')
    ) {
      this.input.focus();
    }
  }

  @HostBinding('class.hasPrefix')
  get prefixState() {
    return this.hasPrefix;
  }
  @HostBinding('class.hasSuffix')
  get suffixState() {
    return this.hasSuffix;
  }
}
