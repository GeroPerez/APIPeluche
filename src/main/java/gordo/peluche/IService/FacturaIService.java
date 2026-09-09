package gordo.peluche.IService;

import java.util.List;
import gordo.peluche.Entidades.Factura;

public interface FacturaIService {
    public List<Factura> findAllFacturas();
    public Factura saveFactura(Factura factura);
}
