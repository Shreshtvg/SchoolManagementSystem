import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-profile-edit-modal',
  templateUrl: './profile-edit-modal.component.html',
  styleUrls: ['./profile-edit-modal.component.scss']
})
export class ProfileEditModalComponent {
  // The current profile data is passed into the modal
  @Input() profileData: any;

  constructor(public activeModal: NgbActiveModal) {}

  onSave(): void {
    // When "Save" is clicked, pass the updated data back to the dashboard component
    this.activeModal.close(this.profileData);
  }
}