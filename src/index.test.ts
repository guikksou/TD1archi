// server.test.ts
import request from 'supertest';
import * as si from 'systeminformation';
import { server } from './server';

// 1. On intercepte (mock) systeminformation
jest.mock('systeminformation');

describe('API System Information', () => {
  afterAll((done) => {
    // Ferme proprement le serveur HTTP Node pour libérer l'event loop Jest
    server.close(done);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/sysinfo', () => {
    it('doit renvoyer un statut 200 et les informations système complètes', async () => {
      // Configuration des valeurs factices renvoyées par le mock
      (si.cpu as jest.Mock).mockResolvedValue({ manufacturer: 'Intel', brand: 'Core i7' });
      (si.system as jest.Mock).mockResolvedValue({ manufacturer: 'Dell', model: 'XPS' });
      (si.mem as jest.Mock).mockResolvedValue({ total: 16000000000, free: 8000000000 });
      (si.osInfo as jest.Mock).mockResolvedValue({ platform: 'linux', distro: 'Ubuntu' });
      (si.currentLoad as jest.Mock).mockResolvedValue({ currentLoad: 12.5 });
      (si.processes as jest.Mock).mockResolvedValue({ all: 150, running: 2 });
      (si.diskLayout as jest.Mock).mockResolvedValue([{ device: '/dev/sda', size: 512000000000 }]);
      (si.networkInterfaces as jest.Mock).mockResolvedValue([{ iface: 'eth0', ip4: '192.168.1.10' }]);

      const response = await request(server)
        .get('/api/v1/sysinfo')
        .expect('Content-Type', /json/)
        .expect(200);

      // Vérification de la structure retournée
      expect(response.body).toEqual({
        cpu: { manufacturer: 'Intel', brand: 'Core i7' },
        system: { manufacturer: 'Dell', model: 'XPS' },
        mem: { total: 16000000000, free: 8000000000 },
        os: { platform: 'linux', distro: 'Ubuntu' },
        currentLoad: { currentLoad: 12.5 },
        processes: { all: 150, running: 2 },
        diskLayout: [{ device: '/dev/sda', size: 512000000000 }],
        networkInterfaces: [{ iface: 'eth0', ip4: '192.168.1.10' }],
      });
    });

    it('doit renvoyer une erreur 500 si un appel à systeminformation échoue', async () => {
      // Simule une défaillance de la lecture CPU
      (si.cpu as jest.Mock).mockRejectedValue(new Error('Erreur matérielle'));

      const response = await request(server)
        .get('/api/v1/sysinfo')
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body).toEqual({
        error: 'Erreur serveur interne',
      });
    });
  });

  describe('Gestion des routes non trouvées ou mauvaises méthodes', () => {
    it('doit renvoyer un statut 404 sur une URL inconnue', async () => {
      const response = await request(server)
        .get('/api/v1/inconnue')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toEqual({
        error: "Qu'est ce que tu cherches ici toi",
      });
    });

    it('doit renvoyer un statut 404 si la méthode est POST au lieu de GET', async () => {
      const response = await request(server)
        .post('/api/v1/sysinfo')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toEqual({
        error: "Qu'est ce que tu cherches ici toi",
      });
    });
  });
});