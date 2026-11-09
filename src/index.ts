import http from 'node:http';
import * as si from 'systeminformation';

const PORT = process.env.PORT || 3000;

export interface ISystemInformation {
  cpu: si.Systeminformation.CpuData;
  system: si.Systeminformation.SystemData;
  mem: si.Systeminformation.MemData;
  os: si.Systeminformation.OsData;
  currentLoad: si.Systeminformation.CurrentLoadData;
  processes: si.Systeminformation.ProcessesData;
  diskLayout: si.Systeminformation.DiskLayoutData[];
  networkInterfaces:
    | si.Systeminformation.NetworkInterfacesData
    | si.Systeminformation.NetworkInterfacesData[];
}

export const server = http.createServer(async (req, res) => {
  // 1. Vérification de la route et de la méthode HTTP
  if (req.url === '/api/v1/sysinfo' && req.method === 'GET') {
    try {
      const data: ISystemInformation = {
        cpu: await si.cpu(),
        system: await si.system(),
        mem: await si.mem(),
        os: await si.osInfo(),
        currentLoad: await si.currentLoad(),
        processes: await si.processes(),
        diskLayout: await si.diskLayout(),
        networkInterfaces: await si.networkInterfaces(),
      };

      // Réponse JSON avec le statut 200 OK
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data, null, 2));
    } catch {
      // Gestion d'erreur
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Erreur serveur interne' }));
    }
  } else {
    // Route non trouvée (404)
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: "Qu'est ce que tu cherches ici toi" }));
  }
});

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}/api/v1/sysinfo`);
  });
}