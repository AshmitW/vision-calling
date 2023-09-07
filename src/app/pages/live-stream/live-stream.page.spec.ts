import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LiveStreamPage } from './live-stream.page';

describe('LiveStreamPage', () => {
  let component: LiveStreamPage;
  let fixture: ComponentFixture<LiveStreamPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(LiveStreamPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
