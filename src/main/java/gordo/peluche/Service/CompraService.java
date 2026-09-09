package gordo.peluche.Service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import gordo.peluche.IService.ClienteIService;
import gordo.peluche.Entidades.Compra;
import gordo.peluche.Repository.CompraRepository;

@Service
public class CompraService implements CompraIService {
    @Autowired
    private CompraRepository cRepository;
    public List<Compra> findAllCompras() {
        return cRepository.findAll();
    }
    public Compra saveCompra(Compra compra) {
        return cRepository.save(compra);
    }
}
