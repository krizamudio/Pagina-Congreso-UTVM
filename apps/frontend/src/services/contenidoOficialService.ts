import axios from "axios";

import { api } from "./api";
import { convertImageToWebp } from "../utils/convertImageToWebp";
import type {
  ArchivoContenido,
  BannerContenido,
  BannerContenidoPayload,
  DestinoImagenContenido,
  NoticiaContenido,
  NoticiaContenidoPayload,
  PaginaOficialContenido,
  SeccionContenido,
  SeccionContenidoPayload
} from "../types/contenido-oficial";

const CONTENT_BASE = "gestion-contenido";

export const contenidoOficialService = {
  async listNoticias() {
    return (await api.get<NoticiaContenido[]>(`${CONTENT_BASE}/noticias`)).data;
  },

  async getNoticia(id: string) {
    return (await api.get<NoticiaContenido>(`${CONTENT_BASE}/noticias/${id}`))
      .data;
  },

  async createNoticia(payload: NoticiaContenidoPayload) {
    return (
      await api.post<NoticiaContenido>(`${CONTENT_BASE}/noticias`, payload)
    ).data;
  },

  async updateNoticia(id: string, payload: Partial<NoticiaContenidoPayload>) {
    return (
      await api.patch<NoticiaContenido>(
        `${CONTENT_BASE}/noticias/${id}`,
        payload
      )
    ).data;
  },

  removeNoticia(id: string) {
    return api.delete<string>(`${CONTENT_BASE}/noticias/${id}`);
  },

  async listSecciones() {
    return (await api.get<SeccionContenido[]>(`${CONTENT_BASE}/secciones`))
      .data;
  },

  async getSeccion(id: string) {
    return (await api.get<SeccionContenido>(`${CONTENT_BASE}/secciones/${id}`))
      .data;
  },

  async createSeccion(payload: SeccionContenidoPayload) {
    return (
      await api.post<SeccionContenido>(`${CONTENT_BASE}/secciones`, payload)
    ).data;
  },

  async updateSeccion(id: string, payload: Partial<SeccionContenidoPayload>) {
    return (
      await api.patch<SeccionContenido>(
        `${CONTENT_BASE}/secciones/${id}`,
        payload
      )
    ).data;
  },

  removeSeccion(id: string) {
    return api.delete<string>(`${CONTENT_BASE}/secciones/${id}`);
  },

  async listBanners() {
    return (await api.get<BannerContenido[]>(`${CONTENT_BASE}/banners`)).data;
  },

  async getBanner(id: string) {
    return (await api.get<BannerContenido>(`${CONTENT_BASE}/banners/${id}`))
      .data;
  },

  async createBanner(payload: BannerContenidoPayload) {
    return (await api.post<BannerContenido>(`${CONTENT_BASE}/banners`, payload))
      .data;
  },

  async updateBanner(id: string, payload: Partial<BannerContenidoPayload>) {
    return (
      await api.patch<BannerContenido>(`${CONTENT_BASE}/banners/${id}`, payload)
    ).data;
  },

  removeBanner(id: string) {
    return api.delete<string>(`${CONTENT_BASE}/banners/${id}`);
  },

  async uploadImage(destino: DestinoImagenContenido, image: File) {
    const optimizedImage = await convertImageToWebp(image);
    const formData = new FormData();
    formData.append("imagen", optimizedImage);
    return (
      await api.post<ArchivoContenido>(
        `${CONTENT_BASE}/imagenes/${destino}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      )
    ).data;
  },

  async updateImage(destino: DestinoImagenContenido, id: string, image: File) {
    const optimizedImage = await convertImageToWebp(image);
    const formData = new FormData();
    formData.append("imagen", optimizedImage);
    return (
      await api.patch<ArchivoContenido>(
        `${CONTENT_BASE}/imagenes/${destino}/${id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      )
    ).data;
  },

  removeImage(destino: DestinoImagenContenido, id: string) {
    return api.delete<string>(`${CONTENT_BASE}/imagenes/${destino}/${id}`);
  },

  async getPaginaOficial(congresoId: string) {
    return (
      await api.get<PaginaOficialContenido>(
        `pagina-oficial/congresos/${congresoId}`
      )
    ).data;
  }
};

export function getContenidoError(
  error: unknown,
  fallback = "No se pudo completar la operación."
) {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error && error.message.trim()
      ? error.message
      : fallback;
  }

  const message = error.response?.data?.message;
  if (Array.isArray(message)) return message.join(" ");
  return typeof message === "string" && message.trim() ? message : fallback;
}
