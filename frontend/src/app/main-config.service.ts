import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class MainConfigService {
  API_URL = 'http://localhost:3000';

  company_id = 'TEST_COMPANY';
  site = 'MAIN';
  name = 'Test Engineer';

  constructor(private snackBar: MatSnackBar) {}

  showSnackBarImage(
    options: { picture: 'success' | 'error'; message: string | string[] },
    duration = 3000
  ): void {
    const message = Array.isArray(options.message)
      ? options.message.join(', ')
      : options.message;

    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: options.picture === 'success' ? 'snack-success' : 'snack-error',
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  confirmModal(message = 'Are you sure?'): Promise<boolean> {
    return Promise.resolve(window.confirm(message));
  }
}
