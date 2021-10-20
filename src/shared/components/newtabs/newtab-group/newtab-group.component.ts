import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  QueryList,
  SimpleChange,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-newtab-group, p-newtab-group',
  templateUrl: './newtab-group.component.html',
  styleUrls: ['./newtab-group.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class NewtabGroupComponent implements AfterContentInit {
  @Input() selectedIndex: number;
  @Output() selectedIndexChange: EventEmitter<number> =
    new EventEmitter<number>();

  @ContentChildren(forwardRef(() => NewTabComponent))
  allTabs: QueryList<NewTabComponent>;

  @ContentChildren(forwardRef(() => NewtabGroupComponent), {
    descendants: true,
  })
  tabGroups: QueryList<NewtabGroupComponent>;

  @ViewChild('inkBar') tabInkBar: ElementRef<HTMLElement>;
  @ViewChild('tabContent') tabContent: ElementRef<HTMLElement>;
  @ViewChild('tabListContainer') tabListContainer: ElementRef<HTMLElement>;

  tabContentsInPage: HTMLElement[] = [];

  showButtons: boolean = false;

  constructor(
    private elementRef: ElementRef,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  @HostListener('window:resize', ['$event'])
  onWindowResize(event) {
    this.showButtons = this.isOverflowing();
  }

  ngAfterContentInit() {
    setTimeout(() => {
      this.selectDefault();
      this.showButtons = this.isOverflowing();
    }, 0);
  }

  selectDefault(): void {
    let activeElement = this.allTabs.find((x) => x.active);
    if (!activeElement) {
      if (this.selectedIndex >= 0) {
        activeElement = this.allTabs.toArray()[this.selectedIndex];
      } else {
        activeElement = this.allTabs.first;
      }
      if (!activeElement.disabled) {
        activeElement.selectTab();
      }
    }
    if (activeElement.disabled) {
      const tabsArray = this.allTabs.toArray();
      let i = 0;
      for (; i < tabsArray.length; i++) {
        if (!tabsArray[i].disabled) {
          activeElement = tabsArray[i];
          activeElement.selectTab();
          break;
        }
      }
    }
    this.setTabIndex();
  }

  setTabIndex(): void {
    const tabsArray = this.allTabs.toArray();
    const selectedIdx = tabsArray.findIndex((x) => x.active);
    if (selectedIdx >= 0) {
      this.selectedIndex = selectedIdx;
      this.selectedIndexChange.emit(this.selectedIndex);
    }
  }

  setInkBar(): void {
    const activeElement = this.allTabs.find((x) => x.active);
    const inkbar = this.tabInkBar.nativeElement;

    const activeElementRect =
      activeElement?.elementRef.nativeElement.getBoundingClientRect();

    const parentElement = activeElement?.elementRef.nativeElement.parentElement;
    const parentElementRect = parentElement?.getBoundingClientRect();

    if (activeElement && !activeElement.disabled) {
      const width = activeElementRect.width - activeElementRect.width / 4;
      inkbar.style.width = width + 'px';
      inkbar.style.left =
        activeElementRect.left -
        parentElementRect.left +
        activeElementRect.width / 4 / 2 +
        'px';
    }
  }

  generateUniqueIds(): void {
    const tabGroups = document.querySelectorAll('.group-tab');
    tabGroups.forEach((x) => {
      this.tabContentsInPage.push(x as HTMLElement);
    });

    const tabIndex = this.tabContentsInPage.findIndex(
      (x) => x === (this.elementRef.nativeElement as HTMLElement)
    );
    const tabs = this.allTabs.toArray();
    let i = 0;
    for (; i < tabs.length; i++) {
      tabs[i].uniqueId = `${tabIndex}-${i}`;
    }
  }

  isOverflowing(): boolean {
    let result: boolean;
    const tabsContainer = this.tabListContainer.nativeElement;
    const tabsList = tabsContainer.firstChild as HTMLElement;
    if (tabsContainer) {
      const fullDifference = tabsList.offsetWidth - tabsContainer.offsetWidth;
      if (fullDifference < 0) {
        result = false;
      } else {
        result = true;
      }
    }
    return result;
  }

  @HostBinding('class.group-tab')
  get DefaultClass() {
    return true;
  }
}

@Component({
  selector: 'app-new-tab, p-new-tab',
  template: `
    <div
      [class]="active ? 'p-tab active' : 'p-tab'"
      [id]="'tab-head-' + uniqueId"
      pRipple
      pRippleColor="var(--primaryLowOpacity)"
      (click)="selectTab()"
    >
      <p-icon>{{ icon }}</p-icon>
      <span>
        {{ label }}
      </span>
    </div>
    <div #content hidden [id]="'tab-content-' + uniqueId">
      <div class="dContents">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class NewTabComponent implements AfterContentInit, OnDestroy {
  @Input() label: string;
  @Input() icon: string;

  @Input() active: boolean;
  @Input() disabled: boolean;

  @ViewChild('content') content: ElementRef<HTMLElement>;

  previousTab: NewTabComponent;

  uniqueId: string;

  constructor(
    public elementRef: ElementRef<HTMLElement>,
    public tabGroup: NewtabGroupComponent
  ) {}

  ngAfterContentInit(): void {
    setTimeout(() => {
      this.setInBody();
      this.tabGroup.generateUniqueIds();
    }, 0);
  }

  selectTab(): void {
    setTimeout(() => {
      const previousActiveTab = this.tabGroup.allTabs.find((x) => x.active);
      if (previousActiveTab) {
        previousActiveTab.active = false;
        previousActiveTab.content.nativeElement.hidden = true;
      }
      const content = document.getElementById('tab-content-' + this.uniqueId);
      if (content) {
        this.active = true;
        this.tabGroup.setInkBar();
        this.tabGroup.setTabIndex();
        content.hidden = false;
        const tabGroupChild = this.tabGroup.tabGroups.toArray();
        if (tabGroupChild.length > 0) {
          tabGroupChild.forEach((x) => {
            const inkbarWidth = x.tabInkBar.nativeElement.offsetWidth;
            if (inkbarWidth === 0) {
              x.setInkBar();
            }
          });
        }
      }
    }, 0);
  }

  setInGroup(): void {
    const tabGroupContent = this.tabGroup.tabContent.nativeElement;
    const content = this.content.nativeElement.firstChild as HTMLElement;
    tabGroupContent.insertAdjacentElement('beforeend', content);
  }

  setInBody(): void {
    const elementRef = this.elementRef.nativeElement as HTMLElement;
    const content = elementRef.lastChild as HTMLElement;
    const contentContainer = this.tabGroup.tabContent;
    if (contentContainer) {
      contentContainer.nativeElement.insertAdjacentElement(
        'beforeend',
        content
      );
    }
  }

  ngOnDestroy() {
    const content = document.getElementById('tab-content-' + this.uniqueId);
    if (content) {
      content.remove();
      this.active = false;
      setTimeout(() => {
        this.tabGroup.selectDefault();
        this.tabGroup.setInkBar();
      }, 0);
    }
  }

  @HostBinding('class.tab-disabled')
  get tabDisabled(): boolean {
    return this.disabled;
  }
}