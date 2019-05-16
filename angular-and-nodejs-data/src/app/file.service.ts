import { HttpClient } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID, Optional } from '@angular/core';
import { BehaviorSubject, Subject, Observable, ReplaySubject } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { isPlatformServer } from '@angular/common';
import { TransferState, makeStateKey, StateKey } from '@angular/platform-browser';


@Injectable({
  providedIn: 'root'
})
export class FileService {
  private fileList: string[] = new Array<string>();

  // Subject er en Observable med multicast til dens registrerede observers.
  // ReplaySubject emitter gamle værdier til nye subscribers. Her buffer den 1 value (fil),
  // som den sender til nye subscribers.
  private fileList$: Subject<string[]> = new ReplaySubject<string[]>(1);
  // BehaviorSubject er en observable der kræver en initial value.
  private displayLoader$: Subject<boolean> = new BehaviorSubject<boolean>(false);

  // listFiles (indholdet af ./user_upload) injectes, hvis koden kører på serveren,
  // og tilføjer listen af filer til Transferstate objektet.
  // Kører koden på klienten kopieres fil listen fra Transferstate objektet
  // til file.service.ts's fileList.
  // PLATFORM_ID bruges til at skelne mellem klient og server.
  constructor(
    private http: HttpClient,
    @Optional() @Inject('LIST_FILES') private listFiles: (callBack) => void,
    @Inject(PLATFORM_ID) private platformId: any,
    private transferState: TransferState
    ) {
      const transferKey: StateKey<string> = makeStateKey<string>('fileList');
      if (isPlatformServer(this.platformId)) {
        this.listFiles((err, files) => {
          this.fileList = files;
          this.transferState.set(transferKey, this.fileList);
        });
      } else {
        this.fileList = this.transferState.get<string[]>(transferKey, []);
      }
      // fileList emittes til file-list templaten.
      this.fileList$.next(this.fileList);
    }

  // Returnerer en Observable, der fortæller om filen er ved at loade.
  public isLoading(): Observable<boolean> {
    return this.displayLoader$;
  }

  public upload(fileName: string, fileContent: string): void {
    // displayLoader$ = true betyder filen loader. Det multicastes til displayLoader$'s Observers.
    this.displayLoader$.next(true);
    // fileName og fileContent indsættes i request body'en.
    this.http.put('/files', {name: fileName, content: fileContent})
    // displayLoader$ sættes til false, når request objektet terminerer.
    .pipe(finalize(() => this.displayLoader$.next(false)))
    // Jeg mener der subscribes til request objektet, og fileName sendes til fileList når request objektet termineres.
    .subscribe(res => {
      this.fileList.push(fileName);

      // Subject (fileList$) er en Observable, men også en Observer,
      // og .next(value) sender value til Subject'et og multicaster til dets Observers.
      this.fileList$.next(this.fileList);
    }, error => {
      this.displayLoader$.next(false);
    });
  }

  public download(fileName: string): void {
    // Blob objekter indeholder rå data, der ikke er begrænset til JavaScript format.
    // File interfacet er baseret på blob typen.
    console.log('før subscription');
    this.http.get(`/files/${fileName}`, { responseType: 'blob'})
    .subscribe(res => {
      console.log('inde i subscription');
      // * Er ikke sikker på hvad der åbnes her? Åbnes filen/dens directory?
      window.open(window.URL.createObjectURL(res));
      console.log('til sidst i subscription');
    });
  }

  // Itererer over name, fjerner 1 element, hvor name er lig med filename,
  // og fileList Subject'et multicaster fileList.
  public remove(fileName): void {
    this.http.delete(`/files/${fileName}`)
    .subscribe(() => {
      // Når delete request'en terminerer, slettes filnavnet fra fileList.
      this.fileList.splice(this.fileList.findIndex(name => name === fileName), 1);
      this.fileList$.next(this.fileList);
    });
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
