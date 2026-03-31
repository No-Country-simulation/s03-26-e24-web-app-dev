/**
 * CmsPro Embed Widget
 * 
 * Widget embebible para mostrar testimonios en sitios externos.
 * 
 * Uso:
 * <script src="https://tu-dominio.com/embed.js"></script>
 * <div id="cmspro-testimonials" data-api-key="tu-api-key"></div>
 * <script>
 *   CmsProWidget.init({
 *     container: '#cmspro-testimonials',
 *     apiKey: 'tu-api-key',
 *     type: 'all', // 'all' | 'testimonial' | 'success_case'
 *     limit: 6,
 *     theme: 'light' // 'light' | 'dark'
 *   });
 * </script>
 */

interface WidgetConfig {
  container: string | HTMLElement;
  apiKey: string;
  apiUrl?: string;
  type?: 'all' | 'testimonial' | 'success_case';
  limit?: number;
  theme?: 'light' | 'dark';
  categoryId?: string;
}

interface Testimony {
  id: string;
  type: 'Testimonial' | 'SuccessCase';
  title: string;
  body: string;
  authorName: string;
  authorRole?: string;
  mediaFiles: Array<{
    type: 'Image' | 'Video';
    url: string;
  }>;
}

class CmsProEmbedWidget {
  private config: WidgetConfig | null = null;

  init(config: WidgetConfig): void {
    this.config = {
      apiUrl: 'http://localhost:5000',
      type: 'all',
      limit: 6,
      theme: 'light',
      ...config,
    };

    this.render();
  }

  private async fetchTestimonials(): Promise<Testimony[]> {
    if (!this.config) return [];

    const params = new URLSearchParams();
    if (this.config.type !== 'all') {
      params.set('type', this.config.type === 'testimonial' ? 'Testimonial' : 'SuccessCase');
    }
    if (this.config.limit) {
      params.set('pageSize', this.config.limit.toString());
    }
    if (this.config.categoryId) {
      params.set('categoryId', this.config.categoryId);
    }

    const response = await fetch(
      `${this.config.apiUrl}/api/public/testimonials?${params.toString()}`,
      {
        headers: {
          'X-API-Key': this.config.apiKey,
        },
      }
    );

    if (!response.ok) {
      console.error('CmsPro Widget: Failed to fetch testimonials');
      return [];
    }

    const data = await response.json();
    return data.items || [];
  }

  private async render(): Promise<void> {
    if (!this.config) return;

    const container =
      typeof this.config.container === 'string'
        ? document.querySelector(this.config.container)
        : this.config.container;

    if (!container) {
      console.error('CmsPro Widget: Container not found');
      return;
    }

    // Add loading state
    container.innerHTML = '<p style="text-align: center;">Cargando testimonios...</p>';

    try {
      const testimonials = await this.fetchTestimonials();

      if (testimonials.length === 0) {
        container.innerHTML = '<p style="text-align: center;">No hay testimonios disponibles.</p>';
        return;
      }

      const isDark = this.config.theme === 'dark';

      container.innerHTML = `
        <div class="cmspro-grid" style="
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
          font-family: system-ui, -apple-system, sans-serif;
        ">
          ${testimonials.map((t) => this.renderCard(t, isDark)).join('')}
        </div>
      `;
    } catch (error) {
      console.error('CmsPro Widget: Error rendering', error);
      container.innerHTML = '<p style="text-align: center; color: red;">Error al cargar testimonios.</p>';
    }
  }

  private renderCard(testimony: Testimony, isDark: boolean): string {
    const image = testimony.mediaFiles.find((m) => m.type === 'Image');
    const isSuccessCase = testimony.type === 'SuccessCase';

    return `
      <article style="
        padding: 1rem;
        border-radius: 0.5rem;
        border: 1px solid ${isDark ? '#333' : '#e5e7eb'};
        background: ${isDark ? '#1f2937' : '#fff'};
        color: ${isDark ? '#f3f4f6' : '#1f2937'};
        ${isSuccessCase ? 'border-left: 4px solid #3b82f6;' : ''}
      ">
        ${isSuccessCase ? '<span style="font-size: 0.75rem; color: #3b82f6; font-weight: 600;">Caso de Éxito</span>' : ''}
        ${image ? `<img src="${image.url}" alt="${testimony.title}" style="width: 100%; border-radius: 0.25rem; margin: 0.5rem 0;" />` : ''}
        <blockquote style="margin: 0.5rem 0; font-style: italic;">
          "${testimony.body}"
        </blockquote>
        <footer style="margin-top: 0.5rem;">
          <strong>${testimony.authorName}</strong>
          ${testimony.authorRole ? `<br><small style="color: ${isDark ? '#9ca3af' : '#6b7280'};">${testimony.authorRole}</small>` : ''}
        </footer>
      </article>
    `;
  }
}

// Export for global use
const widget = new CmsProEmbedWidget();

export default widget;
export { CmsProEmbedWidget };

// Auto-attach to window for IIFE bundle
if (typeof window !== 'undefined') {
  (window as unknown as { CmsProWidget: CmsProEmbedWidget }).CmsProWidget = widget;
}
