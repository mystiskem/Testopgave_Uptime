import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private fileList: string[] = new Array<string>();

  // Subject er en Observable med multicast til dens registrerede observers.
  private fileList$: Subject<string[]> = new Subject<string[]>();
  // BehaviorSubject er en observable der kræver en initial value. Bruges af isLoading().
  private displayLoader$: Subject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  constructor(private http: HttpClient) {}

  public isLoading(): Observable<boolean> {}
  public upload(fileName: string, fileContent: string): void {
    this.fileList.push(fileName);

    // Subject er en Observable, men også en Observer,
    // og .next(value) sender value til Subject'et og multicaster til dets Observers.
    this.fileList$.next(this.fileList);
  }

  public download(fileName: string): void {
    // Indsæt body
  }

  // Itererer over name, fjerner 1 element, hvor name er lig med filename,
  // og fileList Subject'et multicaster fileList.
  public remove(fileName): void {
    this.fileList.splice(this.fileList.findIndex(name => name === fileName), 1);
    this.fileList$.next(this.fileList);
  }

  // Returnerer fileList$ Subject'et.
  public list(): Observable<string[]> {
    return this.fileList$;
  }

  private addFileToList(fileName: string): void {
    this.fileList.push(fileName);
    this.fileList$.next(this.fileList);
  }
}
