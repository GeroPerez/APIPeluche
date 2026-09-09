package gordo.peluche.IService;

import java.util.List;
import gordo.peluche.Entidades.Producto;

public interface ProductoIService {
    public List<Producto> findAllProductos();
    public Producto saveProducto(Producto producto);
}
