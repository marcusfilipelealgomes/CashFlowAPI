import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  template: `
    @for (toast of toasts.toasts(); track toast.id) {
      <div class="toast" [attr.data-kind]="toast.kind" role="status">
        <span class="material-symbols-rounded">
          {{ toast.kind === 'success' ? 'check_circle' : toast.kind === 'error' ? 'error' : 'info' }}
        </span>
        <span class="toast__message">{{ toast.message }}</span>
        <button type="button" (click)="toasts.dismiss(toast.id)" aria-label="Fechar">
          <span class="material-symbols-rounded">close</span>
        </button>
      </div>
    }
  `,
  styles: `
    :host {
      position: fixed;
      right: 1.25rem;
      bottom: 1.25rem;
      z-index: 100;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      max-width: min(380px, calc(100vw - 2.5rem));
    }
    .toast {
      --tone: var(--accent);
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.8rem 0.9rem;
      border-radius: 14px;
      background: rgba(18, 23, 45, 0.96);
      border: 1px solid color-mix(in srgb, var(--tone) 40%, transparent);
      box-shadow: 0 16px 40px -12px rgba(0, 0, 0, 0.6);
      font-size: 0.9rem;
      animation: pop 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .toast[data-kind='success'] { --tone: var(--success); }
    .toast[data-kind='error'] { --tone: var(--danger); }
    .toast > .material-symbols-rounded { color: var(--tone); }
    .toast__message { flex: 1; }
    button {
      display: grid;
      place-items: center;
      border: 0;
      background: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0;
    }
    button .material-symbols-rounded { font-size: 18px; }
    @keyframes pop { from { opacity: 0; transform: translateY(10px) scale(0.97); } }
    @media (max-width: 520px) {
      :host { left: 1rem; right: 1rem; bottom: 1rem; max-width: none; }
    }
  `,
})
export class ToastContainer {
  protected readonly toasts = inject(ToastService);
}
