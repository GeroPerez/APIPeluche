package gordo.peluche.Service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import gordo.peluche.IService.ClienteIService;
import gordo.peluche.Entidades.Factura;
import gordo.peluche.Repository.FacturaRepository;

@Service
public class FacturaService implements FacturaIService {
    @Autowired
    private FacturaRepository fRepository;
    public List<Factura> findAllFacturas() {
        return fRepository.findAll();
    }
    public Factura saveFactura(Factura factura) {
        return fRepository.save(factura);
    }

}
