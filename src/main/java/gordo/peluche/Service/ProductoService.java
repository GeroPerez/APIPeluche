package gordo.peluche.Service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import gordo.peluche.IService.ProductoIService;
import gordo.peluche.Entidades.Producto;
import gordo.peluche.Repository.ProductoRepository;

@Service
public class ProductoService implements ProductoIService{
    @Autowired
    private ProductoRepository pRepository;
    public List<Producto> findAllProductos() {
        return pRepository.findAll();
    }
    public Producto saveProducto(Producto producto) {
        return pRepository.save(producto);
    }

}
