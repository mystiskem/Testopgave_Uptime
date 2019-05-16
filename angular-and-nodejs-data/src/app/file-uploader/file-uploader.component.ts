import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FileService } from '../file.service';

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.css']
})
export class FileUploaderComponent {
  public formGroup = this.fb.group({
    file: [null, Validators.required] // Jeg tror null betyder der ingen child controls er (?), men er ikke sikker.
    // Validators.required gør, at der skal være valgt en fil.
  });

  private fileName;

  constructor(private fb: FormBuilder, private fileService: FileService) {}

  public onFileChange(event) {
    const reader = new FileReader();

    // event.target er file kontrollen i templaten (så vidt jeg forstår).
    if (event.target.files && event.target.files.length) {
      this.fileName = event.target.files[0].name;
      const [file] = event.target.files;

      // Læser filens data, som ender som en base64 encoded data: URL.
      reader.readAsDataURL(file);

      // Så vidt jeg forstår, matches den base64 encodede data: URL med file kontrollen i html-templaten.
      // Således kan formen også validere at der er en 'fil'.
      reader.onload = () => {
        this.formGroup.patchValue({
          file: reader.result
        });
      };
    }
  }

  // Når upload formen submittes bliver fileName pushed til et array (midlertidig logik).
  public onSubmit(): void {
    this.fileService.upload(this.fileName, this.formGroup.get('file').value);
  }
}
