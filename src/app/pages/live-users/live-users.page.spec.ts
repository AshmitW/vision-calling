import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LiveUsersPage } from './live-users.page';

describe('LiveUsersPage', () => {
  let component: LiveUsersPage;
  let fixture: ComponentFixture<LiveUsersPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(LiveUsersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
