import { Component, ElementRef, ViewChild, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('matrix') matrixRef!: ElementRef<HTMLDivElement>;

  currentSessionId: string | null = null;
  username: string = '';
  
  messageText: string = '';
  messageAreaClass: string = 'message-success';
  showMessageArea: boolean = false;
  messageTimeout: any;

  private isDrawing = false;
  private lastX: number | null = null;
  private lastY: number | null = null;
  private drawnBallsThisSession = new Set<string>();

  constructor(private http: HttpClient, private ngZone: NgZone) {}

  ngAfterViewInit() {
    this.ngZone.runOutsideAngular(() => {
      this.initMatrix();
      this.setupEventListeners();
    });
  }

  private initMatrix() {
    const matrix = this.matrixRef.nativeElement;
    const fragment = document.createDocumentFragment();
    const totalBalls = 40 * 100;

    for (let i = 0; i < totalBalls; i++) {
      const ball = document.createElement('div');
      ball.classList.add('ball');
      
      const col = i % 100;
      const row = Math.floor(i / 100);
      ball.dataset['x'] = col.toString();
      ball.dataset['y'] = (39 - row).toString();

      fragment.appendChild(ball);
    }
    
    matrix.appendChild(fragment);
  }

  private setupEventListeners() {
    const matrix = this.matrixRef.nativeElement;

    matrix.addEventListener('contextmenu', (e) => e.preventDefault());

    matrix.addEventListener('mousedown', (e) => {
      if (!this.currentSessionId) {
        this.ngZone.run(() => {
          this.showMessage('Por favor, clique em "Iniciar" primeiro para gerar seu ID de sessão.', true);
        });
        return;
      }

      if (e.button === 0) { 
        e.preventDefault(); 
        this.isDrawing = true;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this.markBallDrawn(e.target as HTMLElement);
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.isDrawing = false;
        this.lastX = null;
        this.lastY = null;
      }
    });

    matrix.addEventListener('mousemove', (e) => {
      if (e.buttons !== 1) {
        this.isDrawing = false;
        this.lastX = null;
        this.lastY = null;
        return;
      }

      if (!this.isDrawing) return;

      const currentX = e.clientX;
      const currentY = e.clientY;

      if (this.lastX !== null && this.lastY !== null) {
        const dx = currentX - this.lastX;
        const dy = currentY - this.lastY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const steps = Math.max(Math.floor(distance / 3), 1);

        for (let i = 0; i <= steps; i++) {
          const x = this.lastX + (dx * i) / steps;
          const y = this.lastY + (dy * i) / steps;
          
          const element = document.elementFromPoint(x, y) as HTMLElement;
          this.markBallDrawn(element);
        }
      }

      this.lastX = currentX;
      this.lastY = currentY;
    });
  }

  private markBallDrawn(ball: HTMLElement) {
    if (!ball || !ball.classList.contains('ball')) return;
    
    if (!ball.classList.contains('drawn')) {
      ball.classList.add('drawn');
    }

    const ballId = `${ball.dataset['x']}-${ball.dataset['y']}`;
    if (this.currentSessionId && !this.drawnBallsThisSession.has(ballId)) {
      this.drawnBallsThisSession.add(ballId);
      
      const payload = {
        type: 'capture',
        nome: this.username.trim() || 'Desconhecido',
        timestamp: Date.now(),
        posicao: {
          x: parseInt(ball.dataset['x']!, 10),
          y: parseInt(ball.dataset['y']!, 10)
        },
        sessao: this.currentSessionId
      };

      this.http.post('http://localhost:1414/api/ingestion', payload).subscribe({
        error: (err) => console.error('Erro ao enviar evento de ingestão:', err)
      });
    }
  }

  generateGUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  showMessage(msg: string, isError = false) {
    this.messageText = msg;
    this.messageAreaClass = isError ? 'message-error' : 'message-success';
    this.showMessageArea = true;
    
    clearTimeout(this.messageTimeout);
    this.messageTimeout = setTimeout(() => {
      this.showMessageArea = false;
    }, 4000);
  }

  iniciarSessao() {
    this.currentSessionId = this.generateGUID();
    this.showMessage(`Sessão iniciada! Você já pode começar a desenhar.`);
  }

  finalizarSessao() {
    if (!this.currentSessionId) {
      this.showMessage('Você precisa clicar em "Iniciar" primeiro!', true);
      return;
    }

    const name = this.username.trim();
    
    if (name) {
      const payload = {
        type: 'finalize',
        nome: name,
        timestamp: Date.now(),
        sessao: this.currentSessionId
      };

      this.http.post('http://localhost:1414/api/ingestion', payload).subscribe();

      this.showMessage(`Obrigado, ${name}! Sua assinatura (ID: ${this.currentSessionId}) foi finalizada.`);
      this.username = ''; 
      this.currentSessionId = null; 
      this.drawnBallsThisSession.clear(); 
      this.clearMatrix();
    } else {
      this.showMessage('Por favor, insira o seu nome antes de finalizar.', true);
    }
  }

  limparDesenho() {
    this.clearMatrix();
  }

  private clearMatrix() {
    const drawnBalls = this.matrixRef.nativeElement.querySelectorAll('.drawn');
    drawnBalls.forEach((ball: Element) => ball.classList.remove('drawn'));
  }
}
